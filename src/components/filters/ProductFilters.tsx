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

  const otherParams = Object.entries(searchParams).filter(
    ([key, value]) => value !== undefined && key !== "minPrice" && key !== "maxPrice" && key !== "page",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-sm font-semibold text-foreground mb-2.5">Price</div>
        <form action={basePath} className="flex items-center gap-2">
          {otherParams.map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
          <input
            type="number"
            name="minPrice"
            min="0"
            defaultValue={searchParams.minPrice}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-full min-w-0 px-2 py-1.5 border border-border rounded-md text-xs"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="number"
            name="maxPrice"
            min="0"
            defaultValue={searchParams.maxPrice}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full min-w-0 px-2 py-1.5 border border-border rounded-md text-xs"
          />
          <button
            type="submit"
            className="shrink-0 px-2.5 py-1.5 border border-border rounded-md text-xs font-medium text-foreground cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>

      <Link
        href={hrefWith("inStock", "true")}
        className="flex items-center gap-2 text-sm text-foreground"
      >
        <span
          aria-hidden="true"
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px]",
            searchParams.inStock === "true"
              ? "bg-foreground border-foreground text-background"
              : "border-border",
          )}
        >
          {searchParams.inStock === "true" && "✓"}
        </span>
        In stock only
      </Link>

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
