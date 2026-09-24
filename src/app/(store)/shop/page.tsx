import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { FilterDrawer } from "@/components/filters/FilterDrawer";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getProducts,
  getAvailableSizes,
  getAvailableColors,
  getAvailableBrands,
} from "@/services/productService";
import { parseProductListParams } from "@/lib/product-query";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata(props: PageProps<"/shop">): Promise<Metadata> {
  const sp = await props.searchParams;
  const isNew = sp.isNew === "true";
  const sale = sp.sale === "true";
  const title = isNew ? "New Arrivals" : sale ? "Sale" : "Shop";
  const description = isNew
    ? "The newest arrivals — everyday essentials, timeless style."
    : sale
      ? "Shop sale — discounted essentials, timeless style."
      : "Shop all products — everyday essentials, timeless style.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: { canonical: `${SITE_URL}/shop` },
  };
}

export default async function ShopPage(props: PageProps<"/shop">) {
  const sp = await props.searchParams;
  const params = parseProductListParams(sp);
  const heading = params.isNew ? "New Arrivals" : params.sale ? "Sale" : "All Products";

  const [result, sizes, colors, brands] = await Promise.all([
    getProducts(params),
    getAvailableSizes(),
    getAvailableColors(),
    getAvailableBrands(),
  ]);
  const facets = { sizes, colors, brands };
  const searchParamsForLinks = sp as Record<string, string>;

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{heading}</h1>
        <p className="text-sm text-muted-foreground">Everyday essentials. Timeless style.</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-[220px] shrink-0">
          <ProductFilters basePath="/shop" searchParams={searchParamsForLinks} facets={facets} />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {result.total} {result.total === 1 ? "product" : "products"}
            </span>
            <div className="flex items-center gap-3">
              <FilterDrawer>
                <ProductFilters
                  basePath="/shop"
                  searchParams={searchParamsForLinks}
                  facets={facets}
                />
              </FilterDrawer>
              <SortDropdown />
            </div>
          </div>

          <ActiveFilters basePath="/shop" searchParams={searchParamsForLinks} />

          {result.products.length > 0 ? (
            <ProductGrid products={result.products} />
          ) : (
            <EmptyState title="No products found" description="Try adjusting your filters." />
          )}

          <Pagination
            basePath="/shop"
            searchParams={searchParamsForLinks}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </div>
  );
}
