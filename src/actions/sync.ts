"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { mergeCart, getCartByUserId, replaceCart } from "@/services/cartService";
import { checkRateLimit } from "@/lib/rateLimit";
import type { CartItem } from "@/types/cart";

export interface SyncResult {
  cartItems: CartItem[];
  wishlistIds: string[];
}

/**
 * Called once on login. Folds the guest (localStorage) cart and wishlist
 * into the user's persistent ones, then returns the resulting DB state so
 * the client can replace its local stores with it — not just push local
 * state up. Without the read-back half, a user logging in on a second
 * device (or after clearing storage) would never see a cart/wishlist they
 * built up previously, since nothing ever re-hydrated from the DB.
 */
export async function syncUserStateAction(
  guestCartItems: CartItem[],
  guestWishlistIds: string[],
): Promise<SyncResult | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const userId = session.user.id;

  // These arrays come straight from the browser's storage, so they're checked
  // like any other input: shape, size and ids are validated, the rest dropped.
  const safeCart = (Array.isArray(guestCartItems) ? guestCartItems : [])
    .filter((i) => i && typeof i === "object" && isValidCartItem(i))
    .slice(0, MAX_CART_LINES);
  const safeWishlist = Array.from(
    new Set((Array.isArray(guestWishlistIds) ? guestWishlistIds : []).filter(isObjectId)),
  ).slice(0, MAX_WISHLIST);

  if (safeCart.length > 0) {
    await mergeCart(userId, safeCart);
  }
  if (safeWishlist.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { wishlist: { $each: safeWishlist } } },
    );
  }

  const [cart, user] = await Promise.all([
    getCartByUserId(userId),
    User.findById(userId).select("wishlist").lean<{ wishlist: { toString(): string }[] }>(),
  ]);

  const cartDoc = cart as {
    items: {
      product: { toString(): string };
      slug: string;
      sku: string;
      name: string;
      priceAtAddition: number;
      quantity: number;
      color?: string;
      size?: string;
      image?: string;
    }[];
  } | null;

  const cartItems: CartItem[] = (cartDoc?.items ?? []).map((item) => ({
    productId: item.product.toString(),
    slug: item.slug,
    sku: item.sku,
    name: item.name,
    price: item.priceAtAddition,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
    image: item.image,
  }));

  const wishlistIds = (user?.wishlist ?? []).map((id) => id.toString());

  return { cartItems, wishlistIds };
}

const MAX_CART_LINES = 50;
const MAX_WISHLIST = 200;
const isObjectId = (v: unknown) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);
const str = (v: unknown, max: number) => typeof v === "string" && v.length > 0 && v.length <= max;

function isValidCartItem(i: CartItem): boolean {
  return (
    isObjectId(i.productId) &&
    str(i.slug, 200) &&
    str(i.sku, 100) &&
    str(i.name, 300) &&
    Number.isFinite(i.price) &&
    i.price >= 0 &&
    Number.isInteger(i.quantity) &&
    i.quantity >= 1 &&
    i.quantity <= 99 &&
    (i.color === undefined || typeof i.color === "string") &&
    (i.size === undefined || typeof i.size === "string") &&
    // Display-only, but it is rendered in <img>/next-image: only accept http(s) or same-site paths.
    (i.image === undefined || (typeof i.image === "string" && i.image.length <= 500 && /^(https:\/\/res\.cloudinary\.com\/|\/(?!\/))/.test(i.image)))
  );
}

/**
 * Persists the client's current cart to the account so it follows the user
 * across devices. Prices stored here are display-only: orders always
 * recompute price server-side.
 */
export async function saveCartAction(items: CartItem[]): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  if (!Array.isArray(items) || items.length > MAX_CART_LINES || !items.every(isValidCartItem)) {
    return { ok: false };
  }

  const limit = await checkRateLimit(`cartsave:${session.user.id}`, 300, 60 * 60 * 1000);
  if (!limit.allowed) return { ok: false };

  await replaceCart(session.user.id, items);
  return { ok: true };
}

/** Current persisted cart, for refreshing a tab that was in the background. */
export async function fetchCartAction(): Promise<CartItem[] | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectDB();
  const cart = (await getCartByUserId(session.user.id)) as {
    items: {
      product: { toString(): string };
      slug: string;
      sku: string;
      name: string;
      priceAtAddition: number;
      quantity: number;
      color?: string;
      size?: string;
      image?: string;
    }[];
  } | null;
  return (cart?.items ?? []).map((item) => ({
    productId: item.product.toString(),
    slug: item.slug,
    sku: item.sku,
    name: item.name,
    price: item.priceAtAddition,
    quantity: item.quantity,
    color: item.color,
    size: item.size,
    image: item.image,
  }));
}
