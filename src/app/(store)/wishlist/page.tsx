"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProductsByIdsAction } from "@/actions/product";
import type { Product } from "@/types/product";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = ids.length > 0 ? getProductsByIdsAction(ids) : Promise.resolve([]);
    fetchProducts.then(setProducts);
  }, [ids]);

  return (
    <div className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-baseline gap-2.5 mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">My Wishlist</h1>
        <span className="text-sm text-muted-foreground">({products.length})</span>
      </div>

      {products.length > 0 ? (
        // Cards carry their own add-to-bag / select-options button.
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          title="Nothing saved yet"
          description="Save products you love and find them here later."
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
