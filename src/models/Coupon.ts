import { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 30 },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    // percent: 1-100, fixed: currency amount
    value: { type: Number, required: true, min: 0.01 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    // null/absent = unlimited redemptions overall
    maxUses: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = models.Coupon || model("Coupon", CouponSchema);
