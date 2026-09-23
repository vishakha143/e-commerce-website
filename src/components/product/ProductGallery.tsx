"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Product } from "@/types/product";

const VIEW_LABELS = ["front", "back", "detail", "worn"];

export function ProductGallery({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const color = product.variants[0]?.color;
  const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeImage = images[activeIndex];

  if (images.length === 0) {
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
        <div className="relative w-full md:w-[440px] h-[500px] md:h-[600px] rounded-lg overflow-hidden order-1 md:order-2">
          <PlaceholderImage
            label={`${product.name} — ${VIEW_LABELS[activeIndex]} view${color ? `, ${color}` : ""}`}
            className="absolute inset-0"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-3.5">
      <div className="flex md:flex-col gap-2.5 order-2 md:order-1">
        {images.map((image, index) => (
          <button
            key={image.publicId}
            type="button"
            aria-label={`View image ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative w-16 h-20 rounded-md overflow-hidden shrink-0 cursor-pointer",
              index === activeIndex ? "border-2 border-foreground" : "border border-border",
            )}
          >
            <Image src={image.url} alt={image.alt || product.name} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative w-full md:w-[440px] h-[500px] md:h-[600px] rounded-lg overflow-hidden order-1 md:order-2">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || `${product.name}${color ? `, ${color}` : ""}`}
          fill
          sizes="(min-width: 768px) 440px, 100vw"
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
