"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { productSchema } from "@/lib/validations/product";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  setProductPublished,
  getProducts,
  getProductsByIds,
  getSearchSuggestions,
} from "@/services/productService";

export interface ProductFormState {
  error?: string;
}

function parseProductForm(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(String(formData.get("variantsJson") ?? "[]"));
  } catch {
    variants = [];
  }

  const compareAtPriceRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "").trim();

  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("imagesJson") ?? "[]"));
  } catch {
    images = [];
  }

  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim(),
    subcategory: String(formData.get("subcategory") ?? "").trim() || undefined,
    brand: String(formData.get("brand") ?? "").trim() || undefined,
    price: Number(formData.get("price")),
    compareAtPrice: compareAtPriceRaw ? Number(compareAtPriceRaw) : undefined,
    featured: formData.get("featured") === "on",
    isNew: formData.get("isNew") === "on",
    tags: tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    images,
    variants,
  };
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await createProduct(parsed.data);
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await updateProduct(id, parsed.data);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function setProductPublishedAction(id: string, published: boolean) {
  await requireAdmin();
  if (typeof published !== "boolean" || !/^[a-f\d]{24}$/i.test(id)) {
    return { success: false, error: "Invalid request." };
  }
  const ok = await setProductPublished(id, published);
  if (!ok) return { success: false, error: "Product not found." };
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Public reads for client components that hold state (wishlist ids, search)
 * only in the browser and so can't run as Server Components.
 */
export async function getProductsByIdsAction(ids: string[]) {
  return getProductsByIds(ids);
}

/** Search-as-you-type. Public read; length-capped and returns at most 6 small rows. */
export async function searchSuggestionsAction(query: string) {
  if (typeof query !== "string") return [];
  const q = query.trim();
  if (q.length < 2 || q.length > 100) return [];
  // Public and hit on (debounced) keystrokes, so cap it per visitor.
  const limit = await checkRateLimit(`suggest:${await getClientIp()}`, 120, 60 * 1000);
  if (!limit.allowed) return [];
  return getSearchSuggestions(q, 6);
}

export async function getSuggestedProductsAction(limit = 3) {
  const result = await getProducts({ sort: "featured", limit });
  return result.products;
}
