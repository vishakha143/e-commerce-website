import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();

  const [revenueAgg, totalOrders, totalCustomers, totalProducts] = await Promise.all([
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
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

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export async function getRevenueSeries(days: number): Promise<DailyRevenue[]> {
  await connectDB();

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
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
    d.setDate(d.getDate() + i);
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

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  await connectDB();

  const rows = await Order.aggregate([
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

export async function getSalesByCategory(): Promise<CategorySales[]> {
  await connectDB();

  const rows = await Order.aggregate([
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
