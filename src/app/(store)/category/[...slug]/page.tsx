import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
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
import { findCategory, findSubcategory } from "@/lib/categories";
import { parseProductListParams } from "@/lib/product-query";
import { buildBreadcrumbJsonLd, safeJsonLd } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata(
  props: PageProps<"/category/[...slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const [categorySlug, subcategorySlug] = slug;
  const category = findCategory(categorySlug);
  const subcategory = subcategorySlug
    ? findSubcategory(categorySlug, subcategorySlug)
    : undefined;
  const name = subcategory?.name ?? category?.name ?? "Category";
  const description = `Shop ${name} — everyday essentials, timeless style.`;

  return {
    title: name,
    description,
    openGraph: { title: name, description, type: "website" },
    alternates: {
      canonical: subcategory
        ? `/category/${categorySlug}/${subcategorySlug}`
        : `/category/${categorySlug}`,
    },
  };
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

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: category.name, url: `${SITE_URL}/category/${categorySlug}` },
    ...(subcategory
      ? [{ name: subcategory.name, url: `${SITE_URL}/category/${categorySlug}/${subcategorySlug}` }]
      : []),
  ];

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />

      <p className="text-xs text-muted-foreground mb-2">
        <Link href="/">Home</Link> / <Link href={`/category/${categorySlug}`}>{category.name}</Link>
        {subcategory ? <> / {subcategory.name}</> : ""}
      </p>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          {subcategory?.name ?? category.name}
        </h1>
        <p className="text-sm text-muted-foreground">Everyday essentials. Timeless style.</p>
      </div>

      {category.children && category.children.length > 0 && (
        <nav aria-label="Subcategories" className="md:hidden -mx-4 px-4 mb-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={`/category/${categorySlug}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold",
              !subcategorySlug ? "bg-foreground text-background border-foreground" : "bg-card text-foreground border-border",
            )}
          >
            All
          </Link>
          {category.children.map((child) => (
            <Link
              key={child.slug}
              href={`/category/${categorySlug}/${child.slug}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold",
                subcategorySlug === child.slug
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-foreground border-border",
              )}
            >
              {child.name}
            </Link>
          ))}
        </nav>
      )}

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
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {result.total} {result.total === 1 ? "product" : "products"}
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

          <ActiveFilters basePath={basePath} searchParams={searchParamsForLinks} />

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
