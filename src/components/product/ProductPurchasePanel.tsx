"use client";

import { useMemo, useState } from "react";
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
    });
  }

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
        <p className="text-sm font-semibold text-accent">Only {stock} left</p>
      )}

      <div>
        <div className="text-sm font-medium text-foreground mb-2">Quantity</div>
        <div className="flex items-center w-[110px] border border-border rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex-1 h-9 text-sm font-semibold cursor-pointer"
          >
            −
          </button>
          <div className="flex-1 text-center text-sm">{qty}</div>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex-1 h-9 text-sm font-semibold cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <AddToCartButton stock={stock} onAdd={handleAdd} />
        <WishlistButton productId={product.id} size="lg" />
      </div>
    </div>
  );
}
