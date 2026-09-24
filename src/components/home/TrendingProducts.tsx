import { SectionHeader } from "@/components/home/SectionHeader";
import { ProductTabs, type ProductTab } from "@/components/home/ProductTabs";
import { getProducts } from "@/services/productService";
import { CATEGORY_TREE } from "@/lib/categories";

const PER_TAB = 8;

export async function TrendingProducts() {
  const [all, ...byCategory] = await Promise.all([
    getProducts({ sort: "featured", limit: PER_TAB }),
    ...CATEGORY_TREE.map((c) => getProducts({ sort: "featured", category: c.slug, limit: PER_TAB })),
  ]);

  const tabs: ProductTab[] = [
    { key: "all", label: "All", href: "/shop", products: all.products },
    ...CATEGORY_TREE.map((c, i) => ({
      key: c.slug,
      label: c.name,
      href: `/category/${c.slug}`,
      products: byCategory[i].products,
    })).filter((t) => t.products.length > 0),
  ];

  if (all.products.length === 0) return null;

  return (
    <section className="px-4 md:px-8 pt-16 max-w-[1600px] mx-auto w-full">
      <SectionHeader eyebrow="Customer favourites" title="Trending now" />
      <ProductTabs tabs={tabs} />
    </section>
  );
}
