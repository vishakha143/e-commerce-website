import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProducts } from "@/services/productService";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const q = sp.q;
  const query = Array.isArray(q) ? q[0] : q;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = pageParam ? Number(pageParam) : undefined;
  const result = query ? await getProducts({ search: query, page, limit: 24 }) : null;
  const searchParamsForLinks = sp as Record<string, string>;

  return (
    <div className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <h1 className="text-2xl font-bold text-foreground mb-1">
        {query ? `Search results for "${query}"` : "Search"}
      </h1>
      {result && (
        <p className="text-sm text-muted-foreground mb-6">{result.total} products found</p>
      )}

      {result ? (
        result.products.length > 0 ? (
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
          <EmptyState
            title="No products found"
            description="Try a different search term or browse our categories."
          />
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Search for products by name, category, or brand.
        </p>
      )}
    </div>
  );
}
