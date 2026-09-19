"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-foreground/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div className="absolute top-0 right-0 h-full w-full max-w-[380px] bg-card shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-[22px] py-5 border-b border-border">
          <span className="text-[15px] font-bold text-foreground">Your Bag ({count})</span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close bag"
            className="cursor-pointer text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[22px] py-4 flex flex-col gap-[18px]">
          {items.length > 0 ? (
            items.map((item) => <CartItem key={item.sku} item={item} variant="drawer" />)
          ) : (
            <EmptyState
              title="Your bag is empty"
              description="Add items to get started."
              action={
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="mt-2 text-sm font-semibold text-foreground underline"
                >
                  Start Shopping
                </Link>
              }
            />
          )}
        </div>

        {items.length > 0 && (
          <div className="px-[22px] py-[18px] border-t border-border">
            <CartSummary variant="drawer" />
          </div>
        )}
      </div>
    </div>
  );
}
