"use client";

import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { useCartStore } from "@/store/cartStore";
import type { CartItem as CartItemType } from "@/types/cart";

export function CartItem({
  item,
  variant = "drawer",
}: {
  item: CartItemType;
  variant?: "drawer" | "page";
}) {
  const increment = useCartStore((s) => s.incrementItem);
  const decrement = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const lineTotal = (item.price * item.quantity).toFixed(2);
  const isPage = variant === "page";

  return (
    <div className={cn("flex gap-3", isPage && "gap-4 pb-[18px] border-b border-border")}>
      <PlaceholderImage
        className={cn("rounded-md shrink-0", isPage ? "w-[88px] h-[110px]" : "w-14 h-[70px]")}
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className={cn("text-foreground", isPage ? "text-sm font-semibold" : "text-[13px] font-medium")}>
          {item.name}
        </div>
        {(item.color || item.size) && (
          <div className="text-xs text-muted-foreground">
            {item.color}
            {item.color && item.size ? " · " : ""}
            {item.size}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 border border-border rounded-md px-1">
            <button
              type="button"
              onClick={() => decrement(item.sku)}
              className="w-[22px] h-[22px] text-sm cursor-pointer"
            >
              −
            </button>
            <span className="text-xs min-w-[10px] text-center">{item.quantity}</span>
            <button
              type="button"
              onClick={() => increment(item.sku)}
              className="w-[22px] h-[22px] text-sm cursor-pointer"
            >
              +
            </button>
          </div>

          {isPage ? (
            <button
              type="button"
              onClick={() => removeItem(item.sku)}
              className="text-xs text-muted-foreground underline cursor-pointer"
            >
              Remove
            </button>
          ) : (
            <span className="text-sm font-semibold text-foreground">${lineTotal}</span>
          )}
        </div>
      </div>

      {isPage && <span className="text-[15px] font-bold text-foreground shrink-0">${lineTotal}</span>}
      {!isPage && (
        <button
          type="button"
          onClick={() => removeItem(item.sku)}
          aria-label="Remove item"
          className="text-xs text-muted-foreground cursor-pointer self-start shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}
