import { Schema, model, models } from "mongoose";

const VariantSchema = new Schema(
  {
    color: String,
    size: String,
    sku: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    category: { type: String, required: true },
    subcategory: String,
    brand: String,
    price: { type: Number, required: true },
    compareAtPrice: Number,
    images: { type: [ProductImageSchema], default: [] },
    variants: { type: [VariantSchema], default: [] },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    // `isNew` shadows Mongoose's internal Document.isNew flag. We only ever
    // read Products via .lean() or mutate via updateOne, never rely on that
    // flag, and the architecture doc names this field `isNew` — so suppress
    // the warning rather than diverge from the documented schema.
    suppressReservedKeysWarning: true,
  },
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ subcategory: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ isNew: 1 });
ProductSchema.index({ name: "text", brand: "text", tags: "text" });

export const Product = models.Product || model("Product", ProductSchema);
