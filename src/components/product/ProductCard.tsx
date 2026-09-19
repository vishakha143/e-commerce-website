import { cn } from "@/lib/utils";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { WishlistButton } from "@/components/product/WishlistButton";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const badge = product.compareAtPrice ? "SALE" : product.isNew ? "NEW" : null;
  const color = product.variants[0]?.color;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden">
        <PlaceholderImage
          label={`${product.name}${color ? `, ${color}` : ""}`}
          className="absolute inset-0"
        />

        {badge && (
          <span
            className={cn(
              "absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide",
              badge === "SALE" ? "bg-[#F4E7E1] text-accent" : "bg-foreground text-background",
            )}
          >
            {badge}
          </span>
        )}

        <WishlistButton productId={product.id} className="absolute top-2 right-2" />
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="text-sm font-medium text-foreground">{product.name}</div>
        {color && <div className="text-[13px] text-muted-foreground">{color}</div>}
        <div className="text-xs text-muted-foreground">
          ★ {product.rating} ({product.reviewCount})
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span
            className={cn(
              "text-[15px] font-semibold",
              product.compareAtPrice ? "text-accent" : "text-foreground",
            )}
          >
            ${product.price}
          </span>
          {product.compareAtPrice && (
            <span className="text-[13px] text-[#A8A5A0] line-through">
              ${product.compareAtPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
