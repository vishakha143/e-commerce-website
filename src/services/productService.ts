import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import type { ProductListParams, ProductListResult } from "@/types/product";

/**
 * Mirrors getProductList() in src/lib/mock-products.ts. Once MONGODB_URI
 * is configured, pages can swap their mock-data import for this service
 * without changing call sites.
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
  if (params.search) {
    filter.$text = { $search: params.search };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    featured: { featured: -1, createdAt: -1 },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProduct(doc: any) {
  return { ...doc, id: doc._id.toString(), _id: undefined };
}
