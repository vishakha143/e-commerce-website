"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { FREE_SHIPPING_THRESHOLD, calculateShipping } from "@/lib/pricing";

function ShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-foreground">
        {remaining > 0 ? (
          <>
            Add <span className="font-semibold">${remaining.toFixed(2)}</span> more for{" "}
            <span className="font-semibold">free shipping</span>
          </>
        ) : (
          <span className="font-semibold text-[#2F6B3F]">You&apos;ve unlocked free shipping!</span>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-label="Progress to free shipping"
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${remaining > 0 ? "bg-accent" : "bg-[#3F6B4C]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CartSummary({
  variant = "page",
  onNavigate,
}: {
  variant?: "drawer" | "page";
  onNavigate?: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  if (variant === "drawer") {
    return (
      <div className="flex flex-col gap-3.5">
        <ShippingProgress subtotal={subtotal} />
        <div className="flex justify-between text-sm font-semibold text-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-2">Shipping and promo codes are applied at checkout.</p>
        <Link
          href="/checkout"
          onClick={onNavigate}
          className="w-full text-center py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
        >
          CHECKOUT
        </Link>
        <Link
          href="/cart"
          onClick={onNavigate}
          className="w-full text-center py-3 border border-foreground text-foreground rounded-md text-xs font-semibold tracking-wide"
        >
          VIEW BAG
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[340px] shrink-0 flex flex-col gap-4 p-6 bg-card border border-border rounded-xl self-start md:sticky md:top-24">
      <div className="font-display text-xl font-bold text-foreground">Order summary</div>
      <ShippingProgress subtotal={subtotal} />
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
      <Link
        href="/checkout"
        className="w-full text-center py-4 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
      >
        PROCEED TO CHECKOUT
      </Link>
      <p className="text-center text-[11px] text-muted-foreground">Cash on delivery · Easy 30-day returns</p>
    </div>
  );
}
