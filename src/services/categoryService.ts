import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import type { CategoryNode } from "@/types/category";

/**
 * Mirrors CATEGORY_TREE in src/lib/categories.ts, built from the
 * Category collection once MONGODB_URI is configured.
 */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  await connectDB();

  const docs = await Category.find().sort({ name: 1 }).lean();
  const bySlug = new Map<string, CategoryNode>(
    docs.map((doc) => [doc.slug, { name: doc.name, slug: doc.slug, children: [] }]),
  );

  const roots: CategoryNode[] = [];
  for (const doc of docs) {
    const node = bySlug.get(doc.slug)!;
    const parentDoc = doc.parent ? docs.find((d) => d._id.equals(doc.parent)) : null;
    if (parentDoc) {
      bySlug.get(parentDoc.slug)?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
