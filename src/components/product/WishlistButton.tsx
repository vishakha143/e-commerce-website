"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function WishlistButton({
  size = "sm",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const [wishlisted, setWishlisted] = useState(false);
  const dimension = size === "lg" ? "w-12 h-12" : "w-8 h-8";
  const iconSize = size === "lg" ? 18 : 15;

  return (
    <button
      type="button"
      aria-label="Toggle wishlist"
      onClick={() => setWishlisted((w) => !w)}
      className={cn(
        dimension,
        "rounded-full bg-card border border-border flex items-center justify-center cursor-pointer shrink-0",
        className,
      )}
    >
      <Heart
        size={iconSize}
        className={wishlisted ? "fill-foreground text-foreground" : "text-[#D8D5CF]"}
      />
    </button>
  );
}
