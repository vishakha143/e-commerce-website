export interface CartItem {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}
