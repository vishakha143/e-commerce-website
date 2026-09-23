export interface ProductVariant {
  color?: string;
  size?: string;
  sku: string;
  stock: number;
}

export interface ProductImage {
  url: string;
  publicId: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  published?: boolean;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
}

export interface ProductListParams {
  search?: string;
  category?: string;
  subcategory?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isNew?: boolean;
  sale?: boolean;
  inStock?: boolean;
  minRating?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "featured" | "rating";
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
