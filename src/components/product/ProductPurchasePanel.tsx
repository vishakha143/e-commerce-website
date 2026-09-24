"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ColorSelector } from "@/components/product/ColorSelector";
import { SizeSelector } from "@/components/product/SizeSelector";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const colors = useMemo(
    () =>
      Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[],
    [product],
  );
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");

  const sizesForColor = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants
            .filter((v) => !selectedColor || v.color === selectedColor)
            .map((v) => v.size)
            .filter(Boolean),
        ),
      ) as string[],
    [product, selectedColor],
  );
  const [selectedSize, setSelectedSize] = useState(sizesForColor[0] ?? "");
  const [qty, setQty] = useState(1);

  const disabledSizes = product.variants
    .filter((v) => (!selectedColor || v.color === selectedColor) && v.stock === 0)
    .map((v) => v.size)
    .filter((size): size is string => Boolean(size));

  // Products with no variants at all (e.g. an accessory with a single SKU)
  // fall back to a synthetic always-in-stock variant keyed by slug.
  const selectedVariant =
    product.variants.length > 0
      ? product.variants.find((v) => v.color === selectedColor && v.size === selectedSize)
      : { sku: product.slug, stock: 999, color: undefined, size: undefined };
  const stock = selectedVariant?.stock ?? 0;

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    const firstAvailable = product.variants.find((v) => v.color === color)?.size ?? "";
    setSelectedSize(firstAvailable);
  }

  function handleAdd() {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      sku: selectedVariant.sku,
      name: product.name,
      price: product.price,
      quantity: qty,
      color: selectedVariant.color,
      size: selectedVariant.size,
      image: (product.images.find((img) => img.isPrimary) ?? product.images[0])?.url,
    });
  }

  // Phones: once the main button scrolls out of view, keep a compact bar pinned
  // to the bottom so buying is always one tap away.
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      // Show only after it has scrolled up past the top (not while still below the fold).
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <ColorSelector colors={colors} selected={selectedColor} onSelect={handleColorSelect} />

      <SizeSelector
        sizes={sizesForColor}
        selected={selectedSize}
        onSelect={setSelectedSize}
        disabledSizes={disabledSizes}
      />

      {stock > 0 && stock <= 5 && (
        <p className="text-sm font-semibold text-accent">Only {stock} left — order soon</p>
      )}

      <div>
        <div className="text-sm font-medium text-foreground mb-2">Quantity</div>
        <div className="inline-flex items-center border border-border rounded-md overflow-hidden bg-card">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-muted"
          >
            <Minus size={14} />
          </button>
          <div className="w-10 text-center text-sm font-medium" aria-live="polite">
            {qty}
          </div>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="h-10 w-10 flex items-center justify-center cursor-pointer hover:bg-muted"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div ref={ctaRef} className="flex gap-3">
        <AddToCartButton stock={stock} onAdd={handleAdd} />
        <WishlistButton productId={product.id} size="lg" />
      </div>

      {showSticky && stock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 border-t border-border bg-card/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0">
            <div className="truncate text-xs text-muted-foreground">{product.name}</div>
            <div className="text-base font-bold text-foreground">${product.price}</div>
          </div>
          <AddToCartButton stock={stock} onAdd={handleAdd} className="!flex-none px-6 py-3" />
        </div>
      )}
    </div>
  );
}
