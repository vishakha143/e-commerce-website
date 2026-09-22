import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { FilterDrawer } from "@/components/filters/FilterDrawer";
import { SortDropdown } from "@/components/filters/SortDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getProducts,
  getAvailableSizes,
  getAvailableColors,
  getAvailableBrands,
} from "@/services/productService";
import { parseProductListParams } from "@/lib/product-query";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop all products — everyday essentials, timeless style.",
};

export default async function ShopPage(props: PageProps<"/shop">) {
  const sp = await props.searchParams;
  const params = parseProductListParams(sp);

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
        <h1 className="text-2xl md:text-[26px] font-bold text-foreground">All Products</h1>
        <p className="text-sm text-muted-foreground">Everyday essentials. Timeless style.</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-[220px] shrink-0">
          <ProductFilters basePath="/shop" searchParams={searchParamsForLinks} facets={facets} />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {result.total} Products
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
