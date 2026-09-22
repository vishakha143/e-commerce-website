export const BRAND_NAME = "Fashion";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://e-commerce-website-gamma-blond-41.vercel.app";

export const ANNOUNCEMENT_TEXT =
  "FREE SHIPPING OVER $150 · EASY 30-DAY RETURNS · SECURE CHECKOUT";

export const NAV_ITEMS = [
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Footwear", href: "/category/footwear" },
  { label: "Accessories", href: "/category/accessories" },
  { label: "New Arrivals", href: "/shop?filter=new" },
] as const;

export const FOOTER_LINKS = {
  SHOP: ["Men", "Women", "Footwear", "Accessories"],
  HELP: ["Shipping", "Returns", "FAQ", "Contact"],
  COMPANY: ["About", "Careers", "Press"],
} as const;
