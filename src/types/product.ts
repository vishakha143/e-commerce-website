export interface ProductVariant {
  color?: string;
  size?: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants?: ProductVariant[];
  color?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
}
