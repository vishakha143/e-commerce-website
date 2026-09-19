import { Schema, model, models, Types } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    color: String,
    size: String,
    priceAtAddition: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export const Cart = models.Cart || model("Cart", CartSchema);
