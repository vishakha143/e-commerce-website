export interface ProductVariant {
  color?: string;
  size?: string;
  sku: string;
  stock: number;
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
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
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
  sort?: "price_asc" | "price_desc" | "newest" | "featured";
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
