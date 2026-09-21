import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
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
import { findCategory, findSubcategory } from "@/lib/categories";
import { parseProductListParams } from "@/lib/product-query";

export async function generateMetadata(
  props: PageProps<"/category/[...slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const [categorySlug, subcategorySlug] = slug;
  const category = findCategory(categorySlug);
  const subcategory = subcategorySlug
    ? findSubcategory(categorySlug, subcategorySlug)
    : undefined;
  return { title: `${subcategory?.name ?? category?.name ?? "Category"} | Fashion` };
}

export default async function CategoryPage(props: PageProps<"/category/[...slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const [categorySlug, subcategorySlug] = slug;

  const category = findCategory(categorySlug);
  if (!category) notFound();

  const subcategory = subcategorySlug
    ? findSubcategory(categorySlug, subcategorySlug)
    : undefined;
  if (subcategorySlug && !subcategory) notFound();

  const basePath = subcategory
    ? `/category/${categorySlug}/${subcategorySlug}`
    : `/category/${categorySlug}`;

  const params = parseProductListParams(sp, {
    category: categorySlug,
    subcategory: subcategorySlug,
  });
  const facetScope = { category: categorySlug, ...(subcategorySlug && { subcategory: subcategorySlug }) };

  const [result, sizes, colors, brands] = await Promise.all([
    getProducts(params),
    getAvailableSizes(facetScope),
    getAvailableColors(facetScope),
    getAvailableBrands(facetScope),
  ]);
  const facets = { sizes, colors, brands };
  const searchParamsForLinks = sp as Record<string, string>;

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto w-full">
      <p className="text-xs text-muted-foreground mb-2">
        Home / {category.name}
        {subcategory ? ` / ${subcategory.name}` : ""}
      </p>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl md:text-[26px] font-bold text-foreground">
          {subcategory?.name ?? category.name}
        </h1>
        <p className="text-sm text-muted-foreground">Everyday essentials. Timeless style.</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:flex w-[220px] shrink-0 flex-col gap-6">
          {category.children && category.children.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2.5">Category</div>
              <div className="flex flex-col gap-1.5">
                {category.children.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/category/${categorySlug}/${child.slug}`}
                    className={cn(
                      "text-sm",
                      subcategorySlug === child.slug
                        ? "font-semibold text-foreground"
                        : "text-foreground/80",
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <ProductFilters basePath={basePath} searchParams={searchParamsForLinks} facets={facets} />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {result.total} Products
            </span>
            <div className="flex items-center gap-3">
              <FilterDrawer>
                <ProductFilters
                  basePath={basePath}
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
            basePath={basePath}
            searchParams={searchParamsForLinks}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </div>
  );
}
