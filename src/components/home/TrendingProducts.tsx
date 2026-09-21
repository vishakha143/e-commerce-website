import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getProducts } from "@/services/productService";

export async function TrendingProducts() {
  const { products } = await getProducts({ sort: "featured", limit: 4 });

  return (
    <section className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Trending Now</h2>
        <Link href="/shop" className="text-xs font-semibold text-foreground">
          View All →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
