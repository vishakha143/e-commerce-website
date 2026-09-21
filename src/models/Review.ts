import { Schema, model, models, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    product: { type: Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ReviewSchema.index({ product: 1 });
ReviewSchema.index({ user: 1 });

export const Review = models.Review || model("Review", ReviewSchema);
