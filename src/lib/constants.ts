export const BRAND_NAME = "Fashion";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://e-commerce-website-gamma-blond-41.vercel.app";

export const ANNOUNCEMENT_TEXT =
  "FREE SHIPPING OVER $150 · EASY 30-DAY RETURNS · SECURE CHECKOUT";

// Rotated one at a time in the announcement bar.
export const ANNOUNCEMENTS = [
  "FREE SHIPPING ON ORDERS OVER $150",
  "EASY 30-DAY RETURNS",
  "CASH ON DELIVERY AVAILABLE",
] as const;

export const NAV_ITEMS = [
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Footwear", href: "/category/footwear" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "New Arrivals", href: "/shop?isNew=true" },
  { label: "Sale", href: "/shop?sale=true" },
] as const;

export const FOOTER_LINKS = {
  SHOP: [
    { label: "Women", href: "/category/women" },
    { label: "Men", href: "/category/men" },
    { label: "Footwear", href: "/category/footwear" },
    { label: "Accessories", href: "/category/accessories" },
    { label: "New Arrivals", href: "/shop?isNew=true" },
    { label: "Sale", href: "/shop?sale=true" },
  ],
  HELP: [
    { label: "Shipping", href: "/help#shipping" },
    { label: "Returns", href: "/help#returns" },
    { label: "Payments", href: "/help#payments" },
    { label: "FAQ", href: "/help#faq" },
  ],
  ACCOUNT: [
    { label: "My account", href: "/account" },
    { label: "Orders", href: "/account/orders" },
    { label: "Wishlist", href: "/wishlist" },
  ],
} as const;

// A variant with 1..LOW_STOCK_THRESHOLD units left counts as "low stock";
// 0 is "out of stock". One place so the admin UI and dashboard agree.
export const LOW_STOCK_THRESHOLD = 3;
