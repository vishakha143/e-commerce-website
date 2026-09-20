export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Cash on Delivery only for now; kept as a union so adding a provider
// later (razorpay, stripe) doesn't require touching the checkout UI.
export type PaymentMethod = "cod";

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}
