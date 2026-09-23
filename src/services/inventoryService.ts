import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { StockAdjustment } from "@/models/StockAdjustment";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { escapeRegex } from "@/lib/utils";

export type InventoryFilter = "all" | "low" | "out";
export type AdjustReason = "restock" | "stocktake" | "damaged" | "return" | "correction";

export interface InventoryRow {
  productId: string;
  name: string;
  sku: string;
  color?: string;
  size?: string;
  stock: number;
}

const MAX_SEARCH_LENGTH = 100;
const MAX_STOCK = 100_000;

export async function getInventorySummary() {
  await connectDB();
  const [row] = await Product.aggregate([
    { $unwind: "$variants" },
    {
      $group: {
        _id: null,
        variants: { $sum: 1 },
        out: { $sum: { $cond: [{ $lte: ["$variants.stock", 0] }, 1, 0] } },
        low: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ["$variants.stock", 0] },
                  { $lte: ["$variants.stock", LOW_STOCK_THRESHOLD] },
                ],
              },
              1,
              0,
            ],
          },
        },
        units: { $sum: "$variants.stock" },
      },
    },
  ]);
  return { variants: row?.variants ?? 0, out: row?.out ?? 0, low: row?.low ?? 0, units: row?.units ?? 0 };
}

export async function listInventory(opts: { filter?: InventoryFilter; q?: string; page?: number; limit?: number }) {
  await connectDB();

  const limit = opts.limit ?? 20;
  const page = opts.page && opts.page > 0 ? Math.floor(opts.page) : 1;

  const match: Record<string, unknown> = {};
  if (opts.filter === "out") match.stock = { $lte: 0 };
  if (opts.filter === "low") match.stock = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };

  const q = opts.q?.trim();
  if (q && q.length <= MAX_SEARCH_LENGTH) {
    const pattern = new RegExp(escapeRegex(q), "i");
    match.$or = [{ name: pattern }, { sku: pattern }];
  }

  const [result] = await Product.aggregate([
    { $unwind: "$variants" },
    {
      $project: {
        name: 1,
        sku: "$variants.sku",
        color: "$variants.color",
        size: "$variants.size",
        stock: "$variants.stock",
      },
    },
    { $match: match },
    {
      $facet: {
        rows: [{ $sort: { stock: 1, name: 1 } }, { $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "n" }],
      },
    },
  ]);

  const total: number = result?.total?.[0]?.n ?? 0;
  const rows: InventoryRow[] = (result?.rows ?? []).map((r: Record<string, unknown>) => ({
    productId: String(r._id),
    name: r.name as string,
    sku: r.sku as string,
    color: r.color as string | undefined,
    size: r.size as string | undefined,
    stock: r.stock as number,
  }));

  return { rows, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export interface AdjustInput {
  productId: string;
  sku: string;
  mode: "add" | "set";
  amount: number;
  reason: AdjustReason;
  note?: string;
  adminId: string;
}

/**
 * Changes one variant's stock and logs it, atomically. The stock update is
 * conditional on the value we just read (optimistic lock), so a concurrent
 * sale or another admin's edit can't be silently overwritten — the change
 * is refused and the admin is asked to refresh instead.
 */
export async function adjustStock(input: AdjustInput): Promise<{ success: boolean; error?: string }> {
  await connectDB();

  const product = await Product.findById(input.productId).lean<{
    name: string;
    variants: { sku: string; stock: number }[];
  }>();
  const variant = product?.variants.find((v) => v.sku === input.sku);
  if (!product || !variant) return { success: false, error: "That product or SKU no longer exists." };

  const before = variant.stock;
  const after = input.mode === "set" ? input.amount : before + input.amount;
  if (!Number.isInteger(after) || after < 0) {
    return { success: false, error: `That would leave ${after} in stock. Stock can't go below 0.` };
  }
  if (after > MAX_STOCK) return { success: false, error: `Stock can't exceed ${MAX_STOCK}.` };
  if (after === before) return { success: false, error: "That doesn't change the stock." };

  const session = await mongoose.startSession();
  try {
    let applied = false;
    await session.withTransaction(async () => {
      const result = await Product.updateOne(
        { _id: input.productId, variants: { $elemMatch: { sku: input.sku, stock: before } } },
        { $set: { "variants.$.stock": after } },
        { session },
      );
      applied = result.modifiedCount === 1;
      if (!applied) return;

      await StockAdjustment.create(
        [
          {
            product: input.productId,
            productName: product.name,
            sku: input.sku,
            before,
            after,
            delta: after - before,
            reason: input.reason,
            note: input.note || undefined,
            admin: input.adminId,
          },
        ],
        { session },
      );
    });

    if (!applied) {
      return {
        success: false,
        error: "Stock changed while you were editing (a sale or another admin). Refresh and try again.",
      };
    }
    return { success: true };
  } finally {
    await session.endSession();
  }
}

export async function getRecentAdjustments(limit = 10) {
  await connectDB();
  return StockAdjustment.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("admin", "name")
    .lean();
}
