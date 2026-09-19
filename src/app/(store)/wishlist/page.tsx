"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { MOCK_PRODUCTS } from "@/lib/mock-products";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const addItem = useCartStore((s) => s.addItem);
  const products = MOCK_PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <div className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-baseline gap-2.5 mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
        <span className="text-sm text-muted-foreground">({products.length})</span>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((product) => {
            const variant = product.variants[0];
            return (
              <div key={product.id} className="flex flex-col gap-2.5">
                <ProductCard product={product} />
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      productId: product.id,
                      slug: product.slug,
                      sku: variant?.sku ?? product.slug,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      color: variant?.color,
                      size: variant?.size,
                    })
                  }
                  className="w-full py-2.5 border border-foreground text-foreground rounded-md text-[11px] font-semibold tracking-wide cursor-pointer"
                >
                  ADD TO BAG
                </button>
              </div>
            );
          })}
        </div>
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
