import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProductList } from "@/lib/mock-products";

export const metadata: Metadata = {
  title: "Search | Fashion",
};

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const result = query ? getProductList({ search: query, limit: 24 }) : null;

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
          <ProductGrid products={result.products} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="text-base font-semibold text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Try a different search term or browse our categories.
            </p>
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          Search for products by name, category, or brand.
        </p>
      )}
    </div>
  );
}
