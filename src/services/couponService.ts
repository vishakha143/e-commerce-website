import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import type { CouponInput } from "@/lib/validations/coupon";

export interface CouponDoc {
  _id: { toString(): string };
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  active: boolean;
}

export type CouponEvaluation =
  | { ok: true; coupon: CouponDoc; discount: number }
  | { ok: false; error: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Checks a code against a subtotal and one shopper. Used for the checkout
 * preview and again, inside the order transaction, when the order is placed:
 * the server recomputes the discount, the client's figure is never trusted.
 * The atomic "claim a redemption" step lives in orderService.
 */
export async function evaluateCoupon(
  rawCode: string,
  subtotal: number,
  userId: string,
): Promise<CouponEvaluation> {
  await connectDB();

  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { ok: false, error: "That code isn't valid." };

  const coupon = await Coupon.findOne({ code }).lean<CouponDoc>();
  // One message for missing/inactive so codes can't be probed for existence.
  if (!coupon || !coupon.active) return { ok: false, error: "That code isn't valid." };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "That code has expired." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "That code has reached its usage limit." };
  }
  if (subtotal < coupon.minSubtotal) {
    return { ok: false, error: `Spend at least $${coupon.minSubtotal.toFixed(2)} to use this code.` };
  }

  const alreadyUsed = await Order.exists({
    user: userId,
    couponCode: code,
    status: { $ne: "cancelled" },
  });
  if (alreadyUsed) return { ok: false, error: "You have already used this code." };

  const raw = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  const discount = round2(Math.min(raw, subtotal));
  if (discount <= 0) return { ok: false, error: "That code doesn't apply to this order." };

  return { ok: true, coupon, discount };
}

export async function listCoupons() {
  await connectDB();
  return Coupon.find().sort({ createdAt: -1 }).lean<CouponDoc[]>();
}

export async function createCoupon(data: CouponInput): Promise<{ success: boolean; error?: string }> {
  await connectDB();
  try {
    await Coupon.create(data);
    return { success: true };
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return { success: false, error: "A coupon with that code already exists." };
    }
    throw err;
  }
}

export async function setCouponActive(id: string, active: boolean) {
  await connectDB();
  const r = await Coupon.updateOne({ _id: id }, { $set: { active } });
  return r.matchedCount === 1;
}

export async function deleteCoupon(id: string) {
  await connectDB();
  // Orders keep the code string, so history stays intact after deletion.
  await Coupon.deleteOne({ _id: id });
}
