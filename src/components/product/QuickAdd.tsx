"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

const BASE =
  "block w-full py-2.5 rounded-md text-[11px] font-semibold tracking-wide text-center border transition-colors";

/**
 * One-tap add from a product card. Only products with a single purchasable
 * variant can be added directly; anything that needs a size/colour choice
 * sends the shopper to the product page instead of guessing.
 *
 * `overlay` is the desktop hover style that sits on top of the photo;
 * `inline` is the always-visible button under the card for touch screens.
 */
export function QuickAdd({
  product,
  variant: style = "inline",
}: {
  product: Product;
  variant?: "inline" | "overlay";
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const primary = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const inStock = product.variants.filter((v) => v.stock > 0);
  const hasVariants = product.variants.length > 0;

  const neutral =
    style === "overlay"
      ? "bg-card/95 backdrop-blur border-transparent text-foreground shadow-sm hover:bg-card"
      : "border-border text-foreground";

  if (hasVariants && inStock.length === 0) {
    return (
      <button type="button" disabled className={cn(BASE, "border-border text-muted-foreground cursor-not-allowed", style === "overlay" && "bg-card/95")}>
        OUT OF STOCK
      </button>
    );
  }

  if (hasVariants && inStock.length > 1) {
    return (
      <Link href={`/product/${product.slug}`} className={cn(BASE, neutral)}>
        SELECT OPTIONS
      </Link>
    );
  }

  const chosen = inStock[0] ?? { sku: product.slug, color: undefined, size: undefined };

  return (
    <button
      type="button"
      onClick={() => {
        addItem({
          productId: product.id,
          slug: product.slug,
          sku: chosen.sku,
          name: product.name,
          price: product.price,
          quantity: 1,
          color: chosen.color,
          size: chosen.size,
          image: primary?.url,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={cn(
        BASE,
        "cursor-pointer",
        added ? "bg-[#3F6B4C] border-[#3F6B4C] text-background" : "bg-foreground border-foreground text-background",
      )}
    >
      {added ? "ADDED ✓" : "ADD TO BAG"}
    </button>
  );
}
