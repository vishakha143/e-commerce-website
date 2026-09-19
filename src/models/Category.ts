import { Schema, model, models, Types } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true },
);

CategorySchema.index({ parent: 1 });

export const Category = models.Category || model("Category", CategorySchema);
