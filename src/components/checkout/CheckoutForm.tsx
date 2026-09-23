"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { placeOrderAction, type CheckoutState } from "@/actions/order";
import { AddressForm } from "@/components/checkout/AddressForm";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import type { AppliedCoupon } from "@/components/checkout/CouponField";
import { EmptyState } from "@/components/ui/EmptyState";

const initialState: CheckoutState = {};

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  // Generated once per mount and resubmitted on every retry (double-click,
  // the form re-enabling after a transient error, a second tab open on the
  // same checkout) so the server can recognize a retry and return the
  // original order instead of creating a duplicate.
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // A discount was computed for a specific bag, so remember which subtotal it
  // was for and ignore it once the bag changes.
  const [appliedCoupon, setAppliedCoupon] = useState<(AppliedCoupon & { subtotal: number }) | null>(null);
  const coupon = appliedCoupon && appliedCoupon.subtotal === subtotal ? appliedCoupon : null;
  const setCoupon = (c: AppliedCoupon | null) => setAppliedCoupon(c ? { ...c, subtotal } : null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const boundAction = placeOrderAction.bind(null, items, idempotencyKey);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.orderId) {
      clearCart();
      router.push(`/checkout/confirmation?orderId=${state.orderId}`);
    }
  }, [state.orderId, clearCart, router]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Add items to your bag before checking out."
        action={
          <Link
            href="/shop"
            className="mt-2 px-5 py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
          >
            START SHOPPING
          </Link>
        }
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 max-w-[520px] flex flex-col gap-5">
        {state.error && (
          <p className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
            {state.error}
          </p>
        )}

        <input type="hidden" name="couponCode" value={coupon?.code ?? ""} />
        <AddressForm />
        <PaymentMethod />

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
        >
          {pending ? "PLACING ORDER..." : "PLACE ORDER"}
        </button>
      </div>

      <CheckoutSummary coupon={coupon} onCouponChange={setCoupon} />
    </form>
  );
}
