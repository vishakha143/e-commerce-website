"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/lib/useIsAdmin";

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
  const isAdmin = useIsAdmin();

  if (isAdmin) {
    return (
      <button
        type="button"
        disabled
        title="Admin accounts manage the store and can't place orders"
        className={cn(
          "flex-1 py-4 rounded-md text-xs font-semibold tracking-wide bg-muted text-muted-foreground cursor-not-allowed",
          className,
        )}
      >
        ADMIN VIEW ONLY
      </button>
    );
  }

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
