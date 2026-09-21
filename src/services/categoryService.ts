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

export async function getAllCategoriesFlat() {
  await connectDB();
  const docs = await Category.find().sort({ name: 1 }).lean();
  const nameById = new Map(docs.map((d) => [d._id.toString(), d.name]));

  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    parentName: doc.parent ? (nameById.get(doc.parent.toString()) ?? null) : null,
  }));
}

export async function createCategory(data: { name: string; slug: string; parent: string | null }) {
  await connectDB();
  return Category.create({ name: data.name, slug: data.slug, parent: data.parent });
}

export async function deleteCategory(id: string) {
  await connectDB();
  await Category.deleteOne({ _id: id });
}
