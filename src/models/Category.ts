import { Schema, model, models, Types } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    parent: { type: Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true },
);

// Subcategory slugs only need to be unique within their parent
// (e.g. "t-shirts" exists under both Men and Women).
CategorySchema.index({ slug: 1, parent: 1 }, { unique: true });

export const Category = models.Category || model("Category", CategorySchema);
