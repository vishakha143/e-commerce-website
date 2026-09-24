"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Product } from "@/types/product";

const VIEW_LABELS = ["front", "back", "detail", "worn"];

/**
 * Phones: a swipeable strip (scroll-snap) with dots. Desktop: a large image
 * with a thumbnail rail. Both show the same list and stay in sync.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const color = product.variants[0]?.color;
  const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const count = images.length > 0 ? images.length : VIEW_LABELS.length;

  function goTo(index: number) {
    setActiveIndex(index);
    const strip = stripRef.current;
    if (strip) strip.scrollTo({ left: strip.clientWidth * index, behavior: "smooth" });
  }

  function onScroll() {
    const strip = stripRef.current;
    if (!strip || strip.clientWidth === 0) return;
    const index = Math.round(strip.scrollLeft / strip.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  }

  const alt = (i: number) =>
    images[i]?.alt || `${product.name}${color ? `, ${color}` : ""}${count > 1 ? ` — view ${i + 1}` : ""}`;

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:sticky md:top-24 md:self-start">
      {/* Thumbnail rail (desktop) */}
      {count > 1 && (
        <div className="hidden md:flex md:flex-col gap-2.5 order-1">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={images[index]?.publicId ?? VIEW_LABELS[index]}
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
              className={cn(
                "relative w-16 h-20 rounded-md overflow-hidden shrink-0 cursor-pointer transition-opacity",
                index === activeIndex ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
              )}
            >
              {images[index] ? (
                <Image src={images[index].url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <PlaceholderImage className="w-full h-full" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="relative order-2 w-full md:w-[480px]">
        <div
          ref={stripRef}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-hidden rounded-lg"
        >
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={images[index]?.publicId ?? VIEW_LABELS[index]}
              className={cn(
                "relative shrink-0 w-full aspect-[4/5] snap-center bg-muted",
                // On desktop only the active slide is shown.
                index !== activeIndex && "md:hidden",
              )}
            >
              {images[index] ? (
                <Image
                  src={images[index].url}
                  alt={alt(index)}
                  fill
                  sizes="(min-width: 768px) 480px, 100vw"
                  priority={index === 0}
                  className="object-cover"
                />
              ) : (
                <PlaceholderImage
                  label={`${product.name} — ${VIEW_LABELS[index]} view${color ? `, ${color}` : ""}`}
                  className="absolute inset-0"
                />
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-white/90 shadow transition-all",
                  i === activeIndex ? "w-5" : "w-1.5 opacity-70",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
