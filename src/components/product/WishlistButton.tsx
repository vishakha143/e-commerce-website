"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";

export function WishlistButton({
  productId,
  size = "sm",
  className,
}: {
  productId: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const wishlisted = useWishlistStore((s) => s.has(productId));
  const toggle = useWishlistStore((s) => s.toggle);
  const dimension = size === "lg" ? "w-12 h-12" : "w-8 h-8";
  const iconSize = size === "lg" ? 18 : 15;

  return (
    <button
      type="button"
      aria-label="Toggle wishlist"
      onClick={() => toggle(productId)}
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
