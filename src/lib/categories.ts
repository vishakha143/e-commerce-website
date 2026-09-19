import type { CategoryNode } from "@/types/category";

/**
 * Data-driven category tree. Backed by the Category collection once
 * MongoDB is wired up (see src/models/Category.ts + src/services/categoryService.ts);
 * this static tree keeps navigation/filtering working until then.
 */
export const CATEGORY_TREE: CategoryNode[] = [
  {
    name: "Men",
    slug: "men",
    children: [
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Shirts", slug: "shirts" },
      { name: "Hoodies", slug: "hoodies" },
    ],
  },
  {
    name: "Women",
    slug: "women",
    children: [
      { name: "Tops", slug: "tops" },
      { name: "Dresses", slug: "dresses" },
      { name: "T-Shirts", slug: "t-shirts" },
    ],
  },
  {
    name: "Footwear",
    slug: "footwear",
    children: [
      { name: "Sneakers", slug: "sneakers" },
      { name: "Casual", slug: "casual" },
      { name: "Sandals", slug: "sandals" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    children: [
      { name: "Belts", slug: "belts" },
      { name: "Bags", slug: "bags" },
      { name: "Wallets", slug: "wallets" },
    ],
  },
];

export function findCategory(slug: string): CategoryNode | undefined {
  return CATEGORY_TREE.find((c) => c.slug === slug);
}

export function findSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): CategoryNode | undefined {
  return findCategory(categorySlug)?.children?.find(
    (c) => c.slug === subcategorySlug,
  );
}
