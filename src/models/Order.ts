import { Schema, model, models, Types } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    size: String,
    color: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const ShippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["cod"], default: "cod" },
    // Client-generated per-checkout-attempt key. A unique+sparse index lets
    // a retried submission (double-click, network retry, a second tab) find
    // and return the order that already exists instead of creating a
    // duplicate; sparse so existing orders from before this field existed
    // don't collide on a shared `null` value.
    idempotencyKey: { type: String },
    // Set by admins as an order moves through fulfilment (courier + tracking id).
    trackingReference: { type: String, trim: true, maxlength: 100 },
    adminNotes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export const Order = models.Order || model("Order", OrderSchema);
