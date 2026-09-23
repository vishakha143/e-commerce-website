"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { checkRateLimit } from "@/lib/rateLimit";
import { adjustStock } from "@/services/inventoryService";

export interface AdjustStockState {
  success?: boolean;
  error?: string;
}

const adjustSchema = z.object({
  productId: z.string().regex(/^[0-9a-f]{24}$/i),
  sku: z.string().min(1).max(100),
  mode: z.enum(["add", "set"]),
  amount: z.coerce.number().int("Enter a whole number").min(-100000).max(100000),
  reason: z.enum(["restock", "stocktake", "damaged", "return", "correction"]),
  note: z.string().trim().max(200, "Note is too long (200 max)").optional(),
});

export async function adjustStockAction(
  _prev: AdjustStockState,
  formData: FormData,
): Promise<AdjustStockState> {
  const session = await requireAdmin();

  const rate = await checkRateLimit(`stock:${session.user.id}`, 60, 60 * 60 * 1000);
  if (!rate.allowed) return { error: "Too many stock changes. Please try again later." };

  const parsed = adjustSchema.safeParse({
    productId: formData.get("productId"),
    sku: formData.get("sku"),
    mode: formData.get("mode"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
    note: String(formData.get("note") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const result = await adjustStock({ ...parsed.data, adminId: session.user.id });
  if (!result.success) return { error: result.error };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  return { success: true };
}
