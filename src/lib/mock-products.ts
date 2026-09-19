import type { Product } from "@/types/product";

/**
 * Placeholder catalog for homepage UI work in Phase 2.
 * Replaced by MongoDB-backed queries in Phase 3 (Product System).
 */
export const MOCK_PRODUCTS: Product[] = [
  { id: "1", slug: "oversized-cotton-tee", name: "Oversized Cotton Tee", category: "men", color: "Black", price: 68, compareAtPrice: 84, images: [], rating: 4.6, reviewCount: 128 },
  { id: "2", slug: "graphic-print-tee", name: "Graphic Print Tee", category: "men", color: "White", price: 58, images: [], rating: 4.4, reviewCount: 96, isNew: true },
  { id: "3", slug: "relaxed-fit-shirt", name: "Relaxed Fit Shirt", category: "men", color: "Ecru", price: 76, compareAtPrice: 96, images: [], rating: 4.7, reviewCount: 210 },
  { id: "4", slug: "basic-crew-tee", name: "Basic Crew Tee", category: "women", color: "Stone", price: 48, images: [], rating: 4.5, reviewCount: 87 },
  { id: "5", slug: "tapered-trousers", name: "Tapered Trousers", category: "women", color: "Olive", price: 98, images: [], rating: 4.3, reviewCount: 62 },
  { id: "6", slug: "striped-knit-tee", name: "Striped Knit Tee", category: "women", color: "Navy", price: 72, images: [], rating: 4.6, reviewCount: 104, isNew: true },
  { id: "7", slug: "court-sneaker", name: "Court Sneaker", category: "footwear", color: "White", price: 148, images: [], rating: 4.5, reviewCount: 73, isNew: true },
  { id: "8", slug: "leather-belt", name: "Leather Belt", category: "accessories", color: "Black", price: 58, images: [], rating: 4.4, reviewCount: 41 },
];
