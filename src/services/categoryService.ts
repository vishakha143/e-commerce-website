import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
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

/**
 * Refuses to delete a category that still has subcategories or products.
 * Product.category is a plain slug string, not a reference, so deleting
 * one in use would silently orphan those products (they'd vanish from the
 * category tree while still existing in the catalog).
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  await connectDB();

  const category = await Category.findById(id).lean<{
    slug: string;
    parent?: mongoose.Types.ObjectId | null;
  }>();
  if (!category) return { success: false, error: "Category not found." };

  if (await Category.exists({ parent: id })) {
    return { success: false, error: "Delete or move its subcategories first." };
  }

  let inUse: unknown;
  if (category.parent) {
    const parent = await Category.findById(category.parent).lean<{ slug: string }>();
    inUse = await Product.exists({ category: parent?.slug, subcategory: category.slug });
  } else {
    inUse = await Product.exists({ category: category.slug });
  }
  if (inUse) {
    return { success: false, error: "Products still use this category. Reassign them first." };
  }

  await Category.deleteOne({ _id: id });
  return { success: true };
}
