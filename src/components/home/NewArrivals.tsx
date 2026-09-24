import { SectionHeader } from "@/components/home/SectionHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getNewArrivals } from "@/services/productService";

export async function NewArrivals() {
  const products = await getNewArrivals(4);
  if (products.length === 0) return null;

  return (
    <section className="px-4 md:px-8 pt-16 max-w-[1600px] mx-auto w-full">
      <SectionHeader eyebrow="Just landed" title="New arrivals" href="/shop?isNew=true" />
      <ProductGrid products={products} />
    </section>
  );
}
