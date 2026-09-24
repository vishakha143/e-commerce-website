import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { COLOR_HEX } from "@/lib/colors";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { WishlistButton } from "@/components/product/WishlistButton";
import { QuickAdd } from "@/components/product/QuickAdd";
import type { Product } from "@/types/product";

const MAX_SWATCHES = 4;

function money(n: number) {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export function ProductCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`;
  const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage = product.images.find((img) => img.isPrimary) ?? sorted[0];
  const hoverImage = sorted.find((img) => img.publicId !== primaryImage?.publicId);

  const colors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];
  const firstColor = colors[0];
  const extraColors = Math.max(0, colors.length - MAX_SWATCHES);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;
  const badge = discount > 0 ? `${discount}% OFF` : product.isNew ? "NEW" : null;
  const soldOut = product.variants.length > 0 && product.variants.every((v) => v.stock <= 0);

  return (
    <div className="group flex flex-col gap-3 w-full">
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-muted">
        <Link href={href} aria-label={product.name} className="absolute inset-0 z-0">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || `${product.name}${firstColor ? `, ${firstColor}` : ""}`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={cn(
                  "object-cover transition-all duration-500",
                  hoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.04]",
                )}
              />
              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <PlaceholderImage
              label={`${product.name}${firstColor ? `, ${firstColor}` : ""}`}
              className="absolute inset-0"
            />
          )}
        </Link>

        {badge && !soldOut && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 pointer-events-none px-2 py-1 rounded text-[10px] font-bold tracking-wider",
              discount > 0 ? "bg-accent text-accent-foreground" : "bg-foreground text-background",
            )}
          >
            {badge}
          </span>
        )}
        {soldOut && (
          <span className="absolute top-2.5 left-2.5 pointer-events-none px-2 py-1 rounded text-[10px] font-bold tracking-wider bg-card text-muted-foreground">
            SOLD OUT
          </span>
        )}

        <WishlistButton productId={product.id} className="absolute top-2 right-2 z-10" />

        {product.reviewCount > 0 && (
          <span className="absolute bottom-2.5 left-2.5 pointer-events-none flex items-center gap-1 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm">
            <span className="text-[#C9922E]">★</span>
            {product.rating}
            <span className="font-normal text-muted-foreground">| {product.reviewCount}</span>
          </span>
        )}

        {/* Desktop: appears over the photo on hover/focus. Touch screens use the inline button below. */}
        <div className="hidden md:block absolute bottom-3 left-3 right-3 z-10 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          <QuickAdd product={product} variant="overlay" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Link href={href} className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:underline underline-offset-4">
          {product.name}
        </Link>

        {colors.length > 0 && (
          <div className="flex items-center gap-1.5" aria-label={`${colors.length} colour${colors.length === 1 ? "" : "s"}`}>
            {colors.slice(0, MAX_SWATCHES).map((color) => (
              <span
                key={color}
                title={color}
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ backgroundColor: COLOR_HEX[color] ?? "#D8D5CF" }}
              />
            ))}
            {extraColors > 0 && <span className="text-[11px] text-muted-foreground">+{extraColors}</span>}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-foreground">{money(product.price)}</span>
          {discount > 0 && product.compareAtPrice && (
            <>
              <span className="text-[13px] text-muted-foreground line-through">{money(product.compareAtPrice)}</span>
              <span className="text-xs font-semibold text-[#2F6B3F]">{discount}% off</span>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <QuickAdd product={product} />
      </div>
    </div>
  );
}
