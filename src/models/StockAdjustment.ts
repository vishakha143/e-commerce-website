import { Schema, model, models, Types } from "mongoose";

/**
 * Append-only log of manual stock changes so inventory is never edited
 * silently: who changed which SKU, from what to what, and why.
 */
const StockAdjustmentSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    before: { type: Number, required: true },
    after: { type: Number, required: true },
    delta: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["restock", "stocktake", "damaged", "return", "correction"],
      required: true,
    },
    note: { type: String, trim: true, maxlength: 200 },
    admin: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

StockAdjustmentSchema.index({ createdAt: -1 });
StockAdjustmentSchema.index({ product: 1, sku: 1, createdAt: -1 });

export const StockAdjustment =
  models.StockAdjustment || model("StockAdjustment", StockAdjustmentSchema);
