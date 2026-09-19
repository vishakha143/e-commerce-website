import type { Product, ProductListParams, ProductListResult } from "@/types/product";

/**
 * In-memory catalog standing in for the MongoDB-backed Product collection.
 * getProductList() mirrors the query contract productService.getProducts()
 * will expose once MONGODB_URI is configured (see src/services/productService.ts),
 * so pages won't need to change when the real service is wired in.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "oversized-black-t-shirt",
    name: "Oversized Black T-Shirt",
    category: "men",
    subcategory: "t-shirts",
    brand: "Fashion",
    price: 68,
    compareAtPrice: 84,
    images: [],
    rating: 4.6,
    reviewCount: 128,
    featured: true,
    variants: [
      { color: "Black", size: "S", sku: "OBT-BLK-S", stock: 12 },
      { color: "Black", size: "M", sku: "OBT-BLK-M", stock: 25 },
      { color: "Black", size: "L", sku: "OBT-BLK-L", stock: 17 },
      { color: "Black", size: "XL", sku: "OBT-BLK-XL", stock: 8 },
      { color: "Black", size: "XXL", sku: "OBT-BLK-XXL", stock: 0 },
    ],
  },
  {
    id: "2",
    slug: "minimal-white-tee",
    name: "Minimal White Tee",
    category: "men",
    subcategory: "t-shirts",
    brand: "Fashion",
    price: 58,
    images: [],
    rating: 4.4,
    reviewCount: 96,
    isNew: true,
    variants: [
      { color: "White", size: "S", sku: "MWT-WHT-S", stock: 20 },
      { color: "White", size: "M", sku: "MWT-WHT-M", stock: 30 },
      { color: "White", size: "L", sku: "MWT-WHT-L", stock: 22 },
      { color: "White", size: "XL", sku: "MWT-WHT-XL", stock: 3 },
    ],
  },
  {
    id: "3",
    slug: "graphic-brown-tee",
    name: "Graphic Brown Tee",
    category: "men",
    subcategory: "t-shirts",
    brand: "Nova",
    price: 62,
    images: [],
    rating: 4.5,
    reviewCount: 74,
    variants: [
      { color: "Brown", size: "M", sku: "GBT-BRN-M", stock: 14 },
      { color: "Brown", size: "L", sku: "GBT-BRN-L", stock: 11 },
      { color: "Brown", size: "XL", sku: "GBT-BRN-XL", stock: 6 },
    ],
  },
  {
    id: "4",
    slug: "relaxed-fit-olive-tee",
    name: "Relaxed Fit Olive Tee",
    category: "women",
    subcategory: "t-shirts",
    brand: "Fashion",
    price: 54,
    compareAtPrice: 68,
    images: [],
    rating: 4.7,
    reviewCount: 156,
    variants: [
      { color: "Olive", size: "XS", sku: "RFO-OLV-XS", stock: 9 },
      { color: "Olive", size: "S", sku: "RFO-OLV-S", stock: 18 },
      { color: "Olive", size: "M", sku: "RFO-OLV-M", stock: 21 },
      { color: "Olive", size: "L", sku: "RFO-OLV-L", stock: 4 },
    ],
  },
  {
    id: "5",
    slug: "classic-polo",
    name: "Classic Polo",
    category: "men",
    subcategory: "shirts",
    brand: "Kestrel",
    price: 76,
    images: [],
    rating: 4.3,
    reviewCount: 62,
    variants: [
      { color: "Navy", size: "S", sku: "CP-NVY-S", stock: 10 },
      { color: "Navy", size: "M", sku: "CP-NVY-M", stock: 16 },
      { color: "Navy", size: "L", sku: "CP-NVY-L", stock: 13 },
      { color: "Navy", size: "XL", sku: "CP-NVY-XL", stock: 7 },
    ],
  },
  {
    id: "6",
    slug: "white-sneakers",
    name: "White Sneakers",
    category: "footwear",
    subcategory: "sneakers",
    brand: "Atlas",
    price: 148,
    images: [],
    rating: 4.5,
    reviewCount: 73,
    isNew: true,
    variants: [
      { color: "White", size: "7", sku: "WSN-WHT-7", stock: 5 },
      { color: "White", size: "8", sku: "WSN-WHT-8", stock: 9 },
      { color: "White", size: "9", sku: "WSN-WHT-9", stock: 11 },
      { color: "White", size: "10", sku: "WSN-WHT-10", stock: 6 },
      { color: "White", size: "11", sku: "WSN-WHT-11", stock: 2 },
    ],
  },
  {
    id: "7",
    slug: "casual-sneakers",
    name: "Casual Sneakers",
    category: "footwear",
    subcategory: "casual",
    brand: "Atlas",
    price: 112,
    images: [],
    rating: 4.2,
    reviewCount: 39,
    variants: [
      { color: "Grey", size: "8", sku: "CSN-GRY-8", stock: 8 },
      { color: "Grey", size: "9", sku: "CSN-GRY-9", stock: 10 },
      { color: "Grey", size: "10", sku: "CSN-GRY-10", stock: 5 },
    ],
  },
  {
    id: "8",
    slug: "leather-belt",
    name: "Leather Belt",
    category: "accessories",
    subcategory: "belts",
    brand: "Fashion",
    price: 58,
    images: [],
    rating: 4.4,
    reviewCount: 41,
    variants: [
      { color: "Black", size: "32", sku: "LB-BLK-32", stock: 15 },
      { color: "Black", size: "34", sku: "LB-BLK-34", stock: 19 },
      { color: "Black", size: "36", sku: "LB-BLK-36", stock: 10 },
    ],
  },
  {
    id: "9",
    slug: "canvas-belt",
    name: "Canvas Belt",
    category: "accessories",
    subcategory: "belts",
    brand: "Fashion",
    price: 38,
    compareAtPrice: 46,
    images: [],
    rating: 4.1,
    reviewCount: 28,
    isNew: true,
    variants: [
      { color: "Olive", size: "32", sku: "CB-OLV-32", stock: 12 },
      { color: "Olive", size: "34", sku: "CB-OLV-34", stock: 14 },
      { color: "Olive", size: "36", sku: "CB-OLV-36", stock: 0 },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductList(params: ProductListParams = {}): ProductListResult {
  let results = [...MOCK_PRODUCTS];

  if (params.category) {
    results = results.filter((p) => p.category === params.category);
  }
  if (params.subcategory) {
    results = results.filter((p) => p.subcategory === params.subcategory);
  }
  if (params.brand) {
    results = results.filter(
      (p) => p.brand?.toLowerCase() === params.brand?.toLowerCase(),
    );
  }
  if (params.size) {
    results = results.filter((p) => p.variants.some((v) => v.size === params.size));
  }
  if (params.color) {
    results = results.filter((p) =>
      p.variants.some((v) => v.color?.toLowerCase() === params.color?.toLowerCase()),
    );
  }
  if (params.minPrice !== undefined) {
    results = results.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= params.maxPrice!);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter((p) =>
      [p.name, p.category, p.subcategory, p.brand, ...(p.tags ?? [])]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(q)),
    );
  }

  switch (params.sort) {
    case "price_asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      results.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      results.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 12;
  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return { products: results.slice(start, start + limit), total, page, limit, totalPages };
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, limit);
}

export function getAvailableSizes(products: Product[] = MOCK_PRODUCTS): string[] {
  return Array.from(
    new Set(products.flatMap((p) => p.variants.map((v) => v.size).filter(Boolean))),
  ) as string[];
}

export function getAvailableColors(products: Product[] = MOCK_PRODUCTS): string[] {
  return Array.from(
    new Set(products.flatMap((p) => p.variants.map((v) => v.color).filter(Boolean))),
  ) as string[];
}

export function getAvailableBrands(products: Product[] = MOCK_PRODUCTS): string[] {
  return Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[];
}
