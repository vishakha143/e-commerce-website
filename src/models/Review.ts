import { Schema, model, models, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    product: { type: Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    // Set server-side from the order history, never from the form.
    verifiedPurchase: { type: Boolean, default: false },
    // Admins can hide a review; hidden reviews are excluded from the storefront and the rating.
    status: { type: String, enum: ["published", "hidden"], default: "published" },
  },
  { timestamps: true },
);

ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ user: 1 });
// One review per customer per product.
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = models.Review || model("Review", ReviewSchema);
