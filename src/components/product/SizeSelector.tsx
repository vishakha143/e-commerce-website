"use client";

import { cn } from "@/lib/utils";

export function SizeSelector({
  sizes,
  selected,
  onSelect,
  disabledSizes = [],
}: {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
  disabledSizes?: string[];
}) {
  if (sizes.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Size</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {sizes.map((size) => {
          const isDisabled = disabledSizes.includes(size);
          const isSelected = selected === size;
          return (
            <button
              key={size}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(size)}
              className={cn(
                "w-11 h-[38px] rounded-md text-xs font-medium cursor-pointer",
                isSelected
                  ? "bg-foreground text-background border border-foreground"
                  : "bg-card text-foreground border border-border",
                isDisabled && "opacity-40 cursor-not-allowed line-through",
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
