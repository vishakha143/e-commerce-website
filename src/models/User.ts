import { Schema, model, models } from "mongoose";

const AddressSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: false },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    image: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    // Sessions issued before this moment are treated as signed out (admin checks).
    passwordChangedAt: { type: Date },
    addresses: { type: [AddressSchema], default: [] },
    wishlist: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  },
  { timestamps: true },
);

export const User = models.User || model("User", UserSchema);
