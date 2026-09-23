"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

const BASE =
  "w-full py-2.5 rounded-md text-[11px] font-semibold tracking-wide text-center border transition-colors";

/**
 * One-tap add from a product card. Only products with a single purchasable
 * variant can be added directly; anything that needs a size/colour choice
 * sends the shopper to the product page instead of guessing.
 */
export function QuickAdd({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const inStock = product.variants.filter((v) => v.stock > 0);
  const hasVariants = product.variants.length > 0;

  if (hasVariants && inStock.length === 0) {
    return (
      <button type="button" disabled className={`${BASE} border-border text-muted-foreground cursor-not-allowed`}>
        OUT OF STOCK
      </button>
    );
  }

  if (hasVariants && inStock.length > 1) {
    return (
      <Link href={`/product/${product.slug}`} className={`${BASE} border-border text-foreground`}>
        SELECT OPTIONS
      </Link>
    );
  }

  const variant = inStock[0] ?? { sku: product.slug, color: undefined, size: undefined };

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          sku: variant.sku,
          name: product.name,
          price: product.price,
          quantity: 1,
          color: variant.color,
          size: variant.size,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`${BASE} cursor-pointer ${
        added ? "bg-[#3F6B4C] border-[#3F6B4C] text-background" : "bg-foreground border-foreground text-background"
      }`}
    >
      {added ? "ADDED ✓" : "ADD TO BAG"}
    </button>
  );
}
