"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { useCartStore } from "@/store/cartStore";
import type { CartItem as CartItemType } from "@/types/cart";

const STEP_BTN =
  "flex h-8 w-8 items-center justify-center cursor-pointer hover:bg-muted transition-colors";

export function CartItem({
  item,
  variant = "drawer",
  onNavigate,
}: {
  item: CartItemType;
  variant?: "drawer" | "page";
  /** Called when the shopper follows the product link (e.g. to close the drawer). */
  onNavigate?: () => void;
}) {
  const increment = useCartStore((s) => s.incrementItem);
  const decrement = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const lineTotal = (item.price * item.quantity).toFixed(2);
  const isPage = variant === "page";
  const href = `/product/${item.slug}`;
  const size = isPage ? "w-[88px] h-[110px]" : "w-[72px] h-[92px]";

  return (
    <div className={cn("flex gap-3.5", isPage && "gap-4 pb-5 border-b border-border")}>
      <Link href={href} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden rounded-md bg-muted", size)}>
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="90px" className="object-cover" />
        ) : (
          <PlaceholderImage className="absolute inset-0" />
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={href}
            onClick={onNavigate}
            className={cn("text-foreground leading-snug hover:underline underline-offset-4", isPage ? "text-sm font-semibold" : "text-[13px] font-medium")}
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.sku)}
            aria-label={`Remove ${item.name}`}
            className="shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {(item.color || item.size) && (
          <div className="text-xs text-muted-foreground">
            {item.color}
            {item.color && item.size ? " · " : ""}
            {item.size && `Size ${item.size}`}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="inline-flex items-center border border-border rounded-md overflow-hidden bg-card">
            <button type="button" onClick={() => decrement(item.sku)} aria-label="Decrease quantity" className={STEP_BTN}>
              <Minus size={13} />
            </button>
            <span className="min-w-[28px] text-center text-xs font-medium" aria-live="polite">
              {item.quantity}
            </span>
            <button type="button" onClick={() => increment(item.sku)} aria-label="Increase quantity" className={STEP_BTN}>
              <Plus size={13} />
            </button>
          </div>
          <span className={cn("font-semibold text-foreground", isPage ? "text-[15px]" : "text-sm")}>${lineTotal}</span>
        </div>
      </div>
    </div>
  );
}
