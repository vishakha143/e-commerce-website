import { ProductGrid } from "@/components/product/ProductGrid";
import { getRelatedProducts } from "@/lib/mock-products";
import type { Product } from "@/types/product";

export function RelatedProducts({ product }: { product: Product }) {
  const related = getRelatedProducts(product);
  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-foreground mb-5">You Might Also Like</h2>
      <ProductGrid products={related} />
    </section>
  );
}
