import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProducts } from "@/services/productService";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = Array.isArray(q) ? q[0] : q;
  const result = query ? await getProducts({ search: query, limit: 24 }) : null;

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
