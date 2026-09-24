"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { calculateShipping } from "@/lib/pricing";
import { CouponField, type AppliedCoupon } from "@/components/checkout/CouponField";

export function CheckoutSummary({
  coupon,
  onCouponChange,
}: {
  coupon: AppliedCoupon | null;
  onCouponChange: (c: AppliedCoupon | null) => void;
}) {
  const items = useCartStore((s) => s.items);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="w-full md:w-[300px] shrink-0 flex flex-col gap-3.5 p-6 bg-card border border-border rounded-lg self-start">
      <div className="font-display text-xl font-bold text-foreground">Order summary</div>

      <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.sku} className="flex items-center gap-3 text-sm text-foreground">
            <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-muted">
              {item.image ? (
                <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
              ) : (
                <PlaceholderImage className="absolute inset-0" />
              )}
              <span className="absolute -top-0 -right-0 rounded-bl bg-foreground px-1 text-[10px] font-semibold text-background">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">{item.name}</div>
              {(item.color || item.size) && (
                <div className="truncate text-xs text-muted-foreground">
                  {[item.color, item.size].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
            <span className="shrink-0 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-border" />
      <CouponField applied={coupon} onChange={onCouponChange} />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-[#2F6B3F]">
          <span>Discount ({coupon?.code})</span>
          <span>-${discount.toFixed(2)}</span>
        </div>
      )}
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
