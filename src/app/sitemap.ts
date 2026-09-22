import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { CATEGORY_TREE } from "@/lib/categories";
import { getAllProductSlugs } from "@/services/productService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_TREE.flatMap((category) => [
    { url: `${SITE_URL}/category/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.7 },
    ...(category.children ?? []).map((child) => ({
      url: `${SITE_URL}/category/${category.slug}/${child.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProductSlugs();
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // MONGODB_URI not configured — ship the static/category routes only.
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
