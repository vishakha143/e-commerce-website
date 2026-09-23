import type { OrderStatus } from "@/types/order";

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
