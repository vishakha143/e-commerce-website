import type { OrderStatus, PaymentStatus } from "@/types/order";

/**
 * Forward-only fulfilment flow. Cancellation is allowed only before an
 * order ships; delivered and cancelled are terminal. Without this an admin
 * could move a delivered order back to pending, or "un-cancel" an order
 * whose stock had already been restored.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function allowedNextStatuses(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status] ?? [];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedNextStatuses(from).includes(to);
}

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["paid", "failed"],
  failed: ["pending", "paid"],
  paid: ["refunded"],
  refunded: [],
};

export function allowedNextPaymentStatuses(
  payment: PaymentStatus,
  orderStatus: OrderStatus,
): PaymentStatus[] {
  // A cancelled order can never be collected on; it can only be refunded.
  return (PAYMENT_TRANSITIONS[payment] ?? []).filter(
    (next) => !(orderStatus === "cancelled" && next === "paid"),
  );
}
