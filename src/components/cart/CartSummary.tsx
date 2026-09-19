"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartSummary({ variant = "page" }: { variant?: "drawer" | "page" }) {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (variant === "drawer") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          {remaining > 0
            ? `You're $${remaining.toFixed(2)} away from free shipping.`
            : "You've unlocked free shipping!"}
        </p>
        <div className="flex justify-between text-sm font-semibold text-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <Link
          href="/cart"
          className="w-full text-center py-3.5 border border-foreground text-foreground rounded-md text-xs font-semibold tracking-wide"
        >
          VIEW BAG
        </Link>
        <Link
          href="/checkout"
          className="w-full text-center py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
        >
          CHECKOUT
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[300px] shrink-0 flex flex-col gap-3.5 p-6 bg-card border border-border rounded-lg self-start">
      <div className="text-base font-bold text-foreground">Order Summary</div>
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
      <Link
        href="/checkout"
        className="mt-1.5 w-full text-center py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
      >
        PROCEED TO CHECKOUT
      </Link>
    </div>
  );
}
