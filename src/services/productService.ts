import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import type { ProductListParams, ProductListResult } from "@/types/product";
import type { ProductInput } from "@/lib/validations/product";

/**
 * Product listing with search/filter/sort/pagination — the storefront's
 * single source of product data (shop, category, search, homepage).
 */
export async function getProducts(
  params: ProductListParams = {},
): Promise<ProductListResult> {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (params.category) filter.category = params.category;
  if (params.subcategory) filter.subcategory = params.subcategory;
  if (params.brand) filter.brand = new RegExp(`^${params.brand}$`, "i");
  if (params.size) filter["variants.size"] = params.size;
  if (params.color) filter["variants.color"] = new RegExp(`^${params.color}$`, "i");
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {
      ...(params.minPrice !== undefined && { $gte: params.minPrice }),
      ...(params.maxPrice !== undefined && { $lte: params.maxPrice }),
    };
  }
  if (params.isNew) filter.isNew = true;
  if (params.sale) filter.compareAtPrice = { $gt: 0 };
  if (params.inStock) filter["variants.stock"] = { $gt: 0 };
  if (params.search) {
    filter.$text = { $search: params.search };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    featured: { featured: -1, createdAt: -1 },
    rating: { rating: -1, reviewCount: -1 },
  };
  const sort = sortMap[params.sort ?? "featured"];

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 12;

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products: docs.map(serializeProduct),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getProductBySlug(slug: string) {
  await connectDB();
  const doc = await Product.findOne({ slug }).lean();
  return doc ? serializeProduct(doc) : null;
}

export async function getAllProductSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  await connectDB();
  return Product.find().select("slug updatedAt").lean();
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectDB();
  const docs = await Product.find({ _id: { $in: ids } }).lean();
  return docs.map(serializeProduct);
}

export async function getRelatedProducts(product: { id: string; category: string }, limit = 4) {
  await connectDB();
  const docs = await Product.find({ category: product.category, _id: { $ne: product.id } })
    .limit(limit)
    .lean();
  return docs.map(serializeProduct);
}

export async function getNewArrivals(limit = 4) {
  await connectDB();
  const docs = await Product.find({ isNew: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(serializeProduct);
}

export interface ProductFacetScope {
  category?: string;
  subcategory?: string;
}

export async function getAvailableSizes(scope: ProductFacetScope = {}): Promise<string[]> {
  await connectDB();
  const sizes = await Product.distinct("variants.size", scope);
  return (sizes as unknown as string[]).filter(Boolean).sort();
}

export async function getAvailableColors(scope: ProductFacetScope = {}): Promise<string[]> {
  await connectDB();
  const colors = await Product.distinct("variants.color", scope);
  return (colors as unknown as string[]).filter(Boolean).sort();
}

export async function getAvailableBrands(scope: ProductFacetScope = {}): Promise<string[]> {
  await connectDB();
  const brands = await Product.distinct("brand", scope);
  return (brands as unknown as string[]).filter(Boolean).sort();
}

export async function getAllProductsAdmin() {
  await connectDB();
  const docs = await Product.find().sort({ createdAt: -1 }).lean();
  return docs.map(serializeProduct);
}

export async function getProductByIdAdmin(id: string) {
  await connectDB();
  const doc = await Product.findById(id).lean();
  return doc ? serializeProduct(doc) : null;
}

export async function createProduct(data: ProductInput) {
  await connectDB();
  const doc = await Product.create(data);
  return serializeProduct(doc.toObject());
}

export async function updateProduct(id: string, data: ProductInput) {
  await connectDB();

  const before = await Product.findById(id).select("images").lean<{
    images?: { publicId: string }[];
  }>();
  const doc = await Product.findByIdAndUpdate(id, data, { new: true }).lean();

  // Best-effort: an image the admin removed from this product is no longer
  // referenced anywhere, so it shouldn't keep taking up free-tier storage.
  // A failed cleanup here doesn't block the save — it just leaves an
  // orphaned asset in Cloudinary, which is a storage-quota concern, not a
  // correctness one.
  const keptIds = new Set((data.images ?? []).map((img) => img.publicId));
  const removed = (before?.images ?? []).filter((img) => !keptIds.has(img.publicId));
  await Promise.all(removed.map((img) => destroyCloudinaryImage(img.publicId).catch(() => {})));

  return doc ? serializeProduct(doc) : null;
}

export async function deleteProduct(id: string) {
  await connectDB();

  const doc = await Product.findByIdAndDelete(id).lean<{ images?: { publicId: string }[] }>();
  const images = doc?.images ?? [];
  await Promise.all(images.map((img) => destroyCloudinaryImage(img.publicId).catch(() => {})));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProduct(doc: any) {
  return { ...doc, id: doc._id.toString(), _id: undefined };
}
