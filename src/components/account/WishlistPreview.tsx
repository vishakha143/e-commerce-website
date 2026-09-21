"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProductsByIdsAction } from "@/actions/product";
import type { Product } from "@/types/product";

export function WishlistPreview() {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts =
      ids.length > 0 ? getProductsByIdsAction(ids.slice(0, 4)) : Promise.resolve([]);
    fetchProducts.then(setProducts);
  }, [ids]);

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
