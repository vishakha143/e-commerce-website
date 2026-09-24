import Link from "next/link";
import { X } from "lucide-react";

const LABELS: Record<string, (v: string) => string> = {
  size: (v) => `Size ${v}`,
  color: (v) => v,
  brand: (v) => v,
  inStock: () => "In stock",
  minRating: (v) => `${v}★ & up`,
};

/** Removable chips for the filters currently applied, plus a clear-all link. */
export function ActiveFilters({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const chips: { key: string; label: string; remove: string[] }[] = [];

  // On /shop the page itself is Sale / New Arrivals; on a category page opened
  // from one of those, keep the mode visible (and removable) as a chip.
  if (basePath !== "/shop") {
    if (searchParams.sale === "true") chips.push({ key: "sale", label: "On sale", remove: ["sale"] });
    if (searchParams.isNew === "true") chips.push({ key: "isNew", label: "New arrivals", remove: ["isNew"] });
  }

  for (const key of Object.keys(LABELS)) {
    const value = searchParams[key];
    if (value) chips.push({ key, label: LABELS[key](value), remove: [key] });
  }
  const { minPrice, maxPrice } = searchParams;
  if (minPrice || maxPrice) {
    const label =
      minPrice && maxPrice ? `$${minPrice} – $${maxPrice}` : minPrice ? `From $${minPrice}` : `Up to $${maxPrice}`;
    chips.push({ key: "price", label, remove: ["minPrice", "maxPrice"] });
  }

  if (chips.length === 0) return null;

  function hrefWithout(keys: string[]) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((e): e is [string, string] => e[1] !== undefined),
    );
    keys.forEach((k) => params.delete(k));
    params.delete("page");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const clearAll = hrefWithout([
    "size",
    "color",
    "brand",
    "inStock",
    "minRating",
    "minPrice",
    "maxPrice",
    ...(basePath !== "/shop" ? ["sale", "isNew"] : []),
  ]);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={hrefWithout(chip.remove)}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-foreground"
        >
          {chip.label}
          <X size={12} aria-hidden />
        </Link>
      ))}
      <Link href={clearAll} className="text-xs font-semibold text-foreground underline underline-offset-4 ml-1">
        Clear all
      </Link>
    </div>
  );
}

/** How many filters are applied (price counts once); used for the Filters button badge. */
export function countActiveFilters(searchParams: Record<string, string | undefined>): number {
  let n = 0;
  for (const key of Object.keys(LABELS)) if (searchParams[key]) n++;
  if (searchParams.minPrice || searchParams.maxPrice) n++;
  return n;
}
