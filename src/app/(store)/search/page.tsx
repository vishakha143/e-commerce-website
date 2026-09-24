import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { FilterDrawer } from "@/components/filters/FilterDrawer";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { ActiveFilters, countActiveFilters } from "@/components/filters/ActiveFilters";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getProducts,
  getAvailableSizes,
  getAvailableColors,
  getAvailableBrands,
} from "@/services/productService";
import { parseProductListParams } from "@/lib/product-query";
import { CATEGORY_TREE } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const rawQuery = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const query = rawQuery?.trim().slice(0, 100) || undefined;
  const searchParamsForLinks = sp as Record<string, string>;

  const params = parseProductListParams(sp, { search: query, limit: 24 });
  const activeCategory = params.category;

  const [result, sizes, colors, brands] = query
    ? await Promise.all([
        getProducts(params),
        getAvailableSizes(),
        getAvailableColors(),
        getAvailableBrands(),
      ])
    : [null, [], [], []];

  const categoryLinks = [
    { label: "All categories", set: { category: null, subcategory: null }, active: !activeCategory },
    ...CATEGORY_TREE.map((c) => ({
      label: c.name,
      set: { category: c.slug, subcategory: null },
      active: activeCategory === c.slug,
    })),
  ];
  const activeCount = countActiveFilters(searchParamsForLinks) + (activeCategory ? 1 : 0);

  return (
    <div className="px-4 md:px-8 py-8 md:py-10 max-w-[1600px] mx-auto w-full">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
        {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}
      </h1>

      {!result && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">Search for products by name, category, colour or brand.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {CATEGORY_TREE.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {result.total} {result.total === 1 ? "product" : "products"}
            </span>
            <div className="flex items-center gap-3">
              <FilterDrawer activeCount={activeCount} resultCount={result.total}>
                <ProductFilters
                  basePath="/search"
                  searchParams={searchParamsForLinks}
                  facets={{ sizes, colors, brands }}
                  categoryLinks={categoryLinks}
                />
              </FilterDrawer>
              <SortDropdown />
            </div>
          </div>

          <ActiveFilters basePath="/search" searchParams={searchParamsForLinks} />

          {result.products.length > 0 ? (
            <>
              <ProductGrid products={result.products} />
              <Pagination
                basePath="/search"
                searchParams={searchParamsForLinks}
                page={result.page}
                totalPages={result.totalPages}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <EmptyState
                title="No products found"
                description="Try a different word, remove a filter, or browse a category."
              />
              <div className="flex flex-wrap justify-center gap-2">
                {CATEGORY_TREE.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-foreground"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
