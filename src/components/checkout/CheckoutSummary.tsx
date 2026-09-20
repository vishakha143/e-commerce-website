"use client";

import { useCartStore } from "@/store/cartStore";
import { calculateShipping } from "@/lib/pricing";

export function CheckoutSummary() {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  return (
    <div className="w-full md:w-[300px] shrink-0 flex flex-col gap-3.5 p-6 bg-card border border-border rounded-lg self-start">
      <div className="text-base font-bold text-foreground">Order Summary</div>

      <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.sku} className="flex justify-between text-sm text-foreground">
            <span className="truncate pr-2">
              {item.name} × {item.quantity}
            </span>
            <span className="shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-border" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Shipping</span>
        <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex justify-between text-base font-bold text-foreground">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
