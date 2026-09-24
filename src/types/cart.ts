export interface CartItem {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  /** Primary product photo, for thumbnails in the bag. Display-only. */
  image?: string;
}
