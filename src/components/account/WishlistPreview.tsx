"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_PRODUCTS } from "@/lib/mock-products";

export function WishlistPreview() {
  const ids = useWishlistStore((s) => s.ids);
  const products = MOCK_PRODUCTS.filter((p) => ids.includes(p.id)).slice(0, 4);

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg">
        <EmptyState
          title="Nothing saved yet"
          description="Products you save will show up here."
          action={
            <Link href="/shop" className="mt-2 text-sm font-semibold text-foreground underline">
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ProductGrid products={products} />
      <Link href="/wishlist" className="text-sm font-semibold text-foreground underline self-start">
        View Full Wishlist →
      </Link>
    </div>
  );
}
