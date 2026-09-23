"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validations/product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductsByIds,
} from "@/services/productService";

export interface ProductFormState {
  error?: string;
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Forbidden");
  }
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

/**
 * Public reads for client components that hold state (wishlist ids, search)
 * only in the browser and so can't run as Server Components.
 */
export async function getProductsByIdsAction(ids: string[]) {
  return getProductsByIds(ids);
}

export async function getSuggestedProductsAction(limit = 3) {
  const result = await getProducts({ sort: "featured", limit });
  return result.products;
}
