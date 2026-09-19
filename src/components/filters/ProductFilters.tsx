import Link from "next/link";
import { cn } from "@/lib/utils";
import { COLOR_HEX } from "@/lib/colors";

export interface ProductFacets {
  sizes: string[];
  colors: string[];
  brands: string[];
}

export function ProductFilters({
  basePath,
  searchParams,
  facets,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  facets: ProductFacets;
}) {
  function hrefWith(key: string, value: string) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-col gap-6">
      {facets.sizes.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-foreground mb-2.5">Size</div>
          <div className="flex flex-wrap gap-1.5">
            {facets.sizes.map((size) => (
              <Link
                key={size}
                href={hrefWith("size", size)}
                className={cn(
                  "w-[38px] h-8 rounded-md border flex items-center justify-center text-xs font-medium",
                  searchParams.size === size
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground",
                )}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>
      )}

      {facets.colors.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-foreground mb-2.5">Color</div>
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((color) => (
              <Link
                key={color}
                href={hrefWith("color", color)}
                aria-label={color}
                className={cn(
                  "w-[22px] h-[22px] rounded-full",
                  searchParams.color === color
                    ? "outline outline-2 outline-offset-1 outline-foreground"
                    : "border border-border",
                )}
                style={{ backgroundColor: COLOR_HEX[color] ?? "#D8D5CF" }}
              />
            ))}
          </div>
        </div>
      )}

      {facets.brands.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-foreground mb-2.5">Brand</div>
          <div className="flex flex-col gap-1.5">
            {facets.brands.map((brand) => (
              <Link
                key={brand}
                href={hrefWith("brand", brand)}
                className={cn(
                  "text-sm",
                  searchParams.brand === brand
                    ? "font-semibold text-foreground"
                    : "text-foreground/80",
                )}
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
