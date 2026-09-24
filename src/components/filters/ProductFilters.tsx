import Link from "next/link";
import { cn } from "@/lib/utils";
import { COLOR_HEX } from "@/lib/colors";

export interface ProductFacets {
  sizes: string[];
  colors: string[];
  brands: string[];
}

export interface CategoryLink {
  label: string;
  /** Path only; the current filters are carried over automatically. */
  path: string;
  active: boolean;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-5">
      <div className="text-sm font-semibold text-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}

/**
 * The single filter panel used by every listing page (Shop, New Arrivals,
 * Sale, and each category), so they all behave the same. Category choices live
 * here too rather than as separate controls above the grid.
 */
export function ProductFilters({
  basePath,
  searchParams,
  facets,
  categoryLinks,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  facets: ProductFacets;
  categoryLinks?: CategoryLink[];
}) {
  function currentParams() {
    return new URLSearchParams(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
  }

  function hrefWith(key: string, value: string) {
    const params = currentParams();
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  /** Switch category but keep the shopper's other filters (and New/Sale mode). */
  function categoryHref(path: string) {
    const params = currentParams();
    params.delete("page");
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  const otherParams = Object.entries(searchParams).filter(
    ([key, value]) => value !== undefined && key !== "minPrice" && key !== "maxPrice" && key !== "page",
  );

  return (
    <div className="flex flex-col gap-5">
      {categoryLinks && categoryLinks.length > 0 && (
        <Group title="Category">
          <ul className="flex flex-col gap-2">
            {categoryLinks.map((link) => (
              <li key={link.path}>
                <Link
                  href={categoryHref(link.path)}
                  aria-current={link.active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between text-sm",
                    link.active ? "font-semibold text-foreground" : "text-foreground/80 hover:text-foreground",
                  )}
                >
                  {link.label}
                  {link.active && <span aria-hidden>✓</span>}
                </Link>
              </li>
            ))}
          </ul>
        </Group>
      )}

      <Group title="Price">
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
            className="w-full min-w-0 px-2 py-1.5 border border-border rounded-md text-xs bg-card"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="number"
            name="maxPrice"
            min="0"
            defaultValue={searchParams.maxPrice}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-full min-w-0 px-2 py-1.5 border border-border rounded-md text-xs bg-card"
          />
          <button
            type="submit"
            className="shrink-0 px-2.5 py-1.5 border border-border rounded-md text-xs font-medium text-foreground cursor-pointer"
          >
            Go
          </button>
        </form>
      </Group>

      <Group title="Availability">
        <Link href={hrefWith("inStock", "true")} className="flex items-center gap-2 text-sm text-foreground">
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
      </Group>

      <Group title="Rating">
        <div className="flex flex-col gap-2">
          {[4, 3].map((n) => (
            <Link
              key={n}
              href={hrefWith("minRating", String(n))}
              className={cn(
                "text-sm",
                searchParams.minRating === String(n) ? "font-semibold text-foreground" : "text-foreground/80",
              )}
            >
              {"★".repeat(n)}
              {"☆".repeat(5 - n)} &amp; up
            </Link>
          ))}
        </div>
      </Group>

      {facets.sizes.length > 0 && (
        <Group title="Size">
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
        </Group>
      )}

      {facets.colors.length > 0 && (
        <Group title="Color">
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((color) => (
              <Link
                key={color}
                href={hrefWith("color", color)}
                aria-label={color}
                title={color}
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
        </Group>
      )}

      {facets.brands.length > 0 && (
        <Group title="Brand">
          <div className="flex flex-col gap-2">
            {facets.brands.map((brand) => (
              <Link
                key={brand}
                href={hrefWith("brand", brand)}
                className={cn(
                  "text-sm",
                  searchParams.brand === brand ? "font-semibold text-foreground" : "text-foreground/80",
                )}
              >
                {brand}
              </Link>
            ))}
          </div>
        </Group>
      )}
    </div>
  );
}
