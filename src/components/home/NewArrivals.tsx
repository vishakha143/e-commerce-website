import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getNewArrivals } from "@/services/productService";

export async function NewArrivals() {
  const products = await getNewArrivals(4);
  if (products.length === 0) return null;

  return (
    <section className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">New Arrivals</h2>
        <Link href="/shop?filter=new" className="text-xs font-semibold text-foreground">
          View All →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
