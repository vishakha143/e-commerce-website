"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { createOrder, updateOrderStatus } from "@/services/orderService";
import { checkRateLimit } from "@/lib/rateLimit";
import type { CartItem } from "@/types/cart";
import type { OrderStatus, ShippingAddress } from "@/types/order";

export interface CheckoutState {
  error?: string;
  orderId?: string;
}

export async function placeOrderAction(
  items: CartItem[],
  idempotencyKey: string,
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please log in to place an order." };
  }

  const rateLimit = await checkRateLimit(`order:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return { error: "Too many orders placed recently. Please try again in a little while." };
  }

  if (!idempotencyKey) {
    return { error: "Could not place order. Please refresh and try again." };
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

  const result = await createOrder(session.user.id, items, shippingAddress, idempotencyKey);
  if (!result.success) {
    return { error: result.error ?? "Could not place order. Please try again." };
  }

  return { orderId: result.orderId };
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Forbidden");
  }

  await updateOrderStatus(orderId, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
