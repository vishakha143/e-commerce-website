"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/authz";
import { checkRateLimit } from "@/lib/rateLimit";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { couponSchema } from "@/lib/validations/coupon";
import {
  evaluateCoupon,
  createCoupon,
  setCouponActive,
  deleteCoupon,
} from "@/services/couponService";
import type { CartItem } from "@/types/cart";

export interface CouponPreview {
  ok: boolean;
  error?: string;
  code?: string;
  discount?: number;
}

/** Checkout preview. Subtotal is rebuilt from DB prices, not the client's cart. */
export async function previewCouponAction(code: string, items: CartItem[]): Promise<CouponPreview> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please log in to use a code." };

  const limit = await checkRateLimit(`coupon:${session.user.id}`, 30, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false, error: "Too many attempts. Try again later." };

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return { ok: false, error: "Your bag is empty." };
  }

  await connectDB();
  let subtotal = 0;
  for (const item of items) {
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) return { ok: false, error: "Invalid bag." };
    if (!/^[a-f\d]{24}$/i.test(String(item.productId))) continue;
    const product = await Product.findById(item.productId)
      .select("price published")
      .lean<{ price: number; published?: boolean }>();
    if (!product || product.published === false) continue;
    subtotal += product.price * qty;
  }

  const result = await evaluateCoupon(String(code ?? ""), subtotal, session.user.id);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, code: result.coupon.code, discount: result.discount };
}

export interface CouponFormState {
  error?: string;
  success?: boolean;
}

export async function createCouponAction(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();

  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();
  const parsed = couponSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    type: formData.get("type"),
    value: Number(formData.get("value")),
    minSubtotal: Number(formData.get("minSubtotal") || 0),
    maxUses: maxUsesRaw ? Number(maxUsesRaw) : null,
    // Valid through the end of the chosen day (UTC).
    expiresAt: expiresRaw ? new Date(`${expiresRaw}T23:59:59.999Z`) : null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  if (parsed.data.expiresAt && Number.isNaN(parsed.data.expiresAt.getTime())) {
    return { error: "Invalid expiry date" };
  }

  const result = await createCoupon(parsed.data);
  if (!result.success) return { error: result.error };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function setCouponActiveAction(id: string, active: boolean) {
  await requireAdmin();
  if (!/^[a-f\d]{24}$/i.test(id) || typeof active !== "boolean") return { success: false };
  const ok = await setCouponActive(id, active);
  revalidatePath("/admin/coupons");
  return { success: ok };
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  if (!/^[a-f\d]{24}$/i.test(id)) return { success: false };
  await deleteCoupon(id);
  revalidatePath("/admin/coupons");
  return { success: true };
}
