"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Product } from "@/types/product";

const VIEW_LABELS = ["front", "back", "detail", "worn"];

export function ProductGallery({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const color = product.variants[0]?.color;

  return (
    <div className="flex flex-col md:flex-row gap-3.5">
      <div className="flex md:flex-col gap-2.5 order-2 md:order-1">
        {VIEW_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-16 h-20 rounded-md overflow-hidden shrink-0 cursor-pointer",
              index === activeIndex ? "border-2 border-foreground" : "border border-border",
            )}
          >
            <PlaceholderImage className="w-full h-full" />
          </button>
        ))}
      </div>
      <div className="w-full md:w-[440px] h-[500px] md:h-[600px] rounded-lg overflow-hidden order-1 md:order-2">
        <PlaceholderImage
          label={`${product.name} — ${VIEW_LABELS[activeIndex]} view${color ? `, ${color}` : ""}`}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
