"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto w-full">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">Your bag ({count})</h1>

      {items.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {items.map((item) => (
              <CartItem key={item.sku} item={item} variant="page" />
            ))}
          </div>
          <CartSummary variant="page" />
        </div>
      ) : (
        <EmptyState
          title="Your bag is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Link
              href="/shop"
              className="mt-2 px-5 py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
            >
              START SHOPPING
            </Link>
          }
        />
      )}
    </div>
  );
}
