"use client";

import { cn } from "@/lib/utils";
import { COLOR_HEX } from "@/lib/colors";

export function ColorSelector({
  colors,
  selected,
  onSelect,
}: {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
}) {
  if (colors.length === 0) return null;

  return (
    <div>
      <div className="text-sm font-medium text-foreground mb-2">Color: {selected}</div>
      <div className="flex gap-2.5">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => onSelect(color)}
            className={cn(
              "w-7 h-7 rounded-full cursor-pointer",
              selected === color ? "border-2 border-foreground" : "border border-border",
            )}
            style={{ backgroundColor: COLOR_HEX[color] ?? "#D8D5CF" }}
          />
        ))}
      </div>
    </div>
  );
}
