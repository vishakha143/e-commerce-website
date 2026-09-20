"use server";

import { auth } from "@/lib/auth";
import { createOrder } from "@/services/orderService";
import type { CartItem } from "@/types/cart";
import type { ShippingAddress } from "@/types/order";

export interface CheckoutState {
  error?: string;
  orderId?: string;
}

export async function placeOrderAction(
  items: CartItem[],
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to place an order." };
  }

  const shippingAddress: ShippingAddress = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    pincode: String(formData.get("pincode") ?? "").trim(),
  };

  if (Object.values(shippingAddress).some((field) => field.length === 0)) {
    return { error: "Please fill in all address fields." };
  }

  const result = await createOrder(session.user.id, items, shippingAddress);
  if (!result.success) {
    return { error: result.error ?? "Could not place order. Please try again." };
  }

  return { orderId: result.orderId };
}
