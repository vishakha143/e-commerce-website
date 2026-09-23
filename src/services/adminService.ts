import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { getInventorySummary } from "@/services/inventoryService";

// Cancelled orders never produced revenue (their stock is restored), so they
// stay out of every money figure below.
const COUNTS_AS_SALE = { status: { $ne: "cancelled" } };

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();

  const [revenueAgg, totalOrders, totalCustomers, totalProducts] = await Promise.all([
    Order.aggregate([{ $match: COUNTS_AS_SALE }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
  ]);

  return {
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalOrders,
    totalCustomers,
    totalProducts,
  };
}

/**
 * Start (00:00 UTC) of the first day in a window of `days` days ending today.
 * Everything here is UTC: Mongo's $dateToString buckets in UTC, so building
 * the day keys from local time would shift late-evening orders onto the wrong day.
 */
function windowStart(days: number): Date {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);
  return since;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export async function getRevenueSeries(days: number): Promise<DailyRevenue[]> {
  await connectDB();

  const since = windowStart(days);

  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, ...COUNTS_AS_SALE } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
  ]);

  const byDate = new Map(rows.map((r) => [r._id as string, { revenue: r.revenue, orders: r.orders }]));
  const series: DailyRevenue[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    series.push({ date: key, revenue: entry?.revenue ?? 0, orders: entry?.orders ?? 0 });
  }
  return series;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export async function getTopProducts(limit = 5, days?: number): Promise<TopProduct[]> {
  await connectDB();

  const rows = await Order.aggregate([
    { $match: { ...COUNTS_AS_SALE, ...(days && { createdAt: { $gte: windowStart(days) } }) } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.sku",
        name: { $first: "$items.name" },
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({ name: r.name, quantity: r.quantity, revenue: r.revenue }));
}

export interface CategorySales {
  category: string;
  revenue: number;
}

export async function getSalesByCategory(days?: number): Promise<CategorySales[]> {
  await connectDB();

  const rows = await Order.aggregate([
    { $match: { ...COUNTS_AS_SALE, ...(days && { createdAt: { $gte: windowStart(days) } }) } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ["$productDoc.category", "unknown"] },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return rows.map((r) => ({ category: r._id as string, revenue: r.revenue }));
}

export async function getAttentionCounts() {
  await connectDB();
  const [pendingOrders, inventory] = await Promise.all([
    Order.countDocuments({ status: "pending" }),
    getInventorySummary(),
  ]);
  return { pendingOrders, lowStock: inventory.low, outOfStock: inventory.out };
}

export interface CustomerOrderStats {
  orders: number;
  spent: number;
}

/** Per-customer order count and lifetime spend (cancelled orders excluded from both). */
export async function getCustomerOrderStats(): Promise<Map<string, CustomerOrderStats>> {
  await connectDB();
  const rows = await Order.aggregate([
    { $match: COUNTS_AS_SALE },
    { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), { orders: r.orders, spent: r.spent }]));
}
