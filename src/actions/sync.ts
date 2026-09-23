"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { mergeCart, getCartByUserId } from "@/services/cartService";
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

  if (guestCartItems.length > 0) {
    await mergeCart(userId, guestCartItems);
  }
  if (guestWishlistIds.length > 0) {
    await User.updateOne(
      { _id: userId },
      { $addToSet: { wishlist: { $each: guestWishlistIds } } },
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
  }));

  const wishlistIds = (user?.wishlist ?? []).map((id) => id.toString());

  return { cartItems, wishlistIds };
}
