"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { createCategory, deleteCategory } from "@/services/categoryService";

export interface CategoryFormState {
  error?: string;
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const parent = String(formData.get("parent") ?? "").trim() || null;

  if (!name || !slug) {
    return { error: "Name and slug are required" };
  }

  await createCategory({ name, slug, parent });
  revalidatePath("/admin/categories");
  return {};
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const result = await deleteCategory(id);
  if (result.success) revalidatePath("/admin/categories");
  return result;
}
