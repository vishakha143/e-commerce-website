"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  stock,
  onAdd,
  className,
}: {
  stock: number;
  onAdd: () => void;
  className?: string;
}) {
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "flex-1 py-4 rounded-md text-xs font-semibold tracking-wide bg-muted text-muted-foreground cursor-not-allowed",
          className,
        )}
      >
        OUT OF STOCK
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onAdd();
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={cn(
        "flex-1 py-4 rounded-md text-xs font-semibold tracking-wide text-background cursor-pointer transition-colors",
        added ? "bg-[#3F6B4C]" : "bg-foreground",
        className,
      )}
    >
      {added ? "ADDED ✓" : "ADD TO BAG"}
    </button>
  );
}
