export const FREE_SHIPPING_THRESHOLD = 150;
export const STANDARD_SHIPPING_COST = 8;

/**
 * Single source of truth for the shipping rule, used by the cart/checkout
 * UI for display AND by orderService for the server-authoritative total.
 */
export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}
