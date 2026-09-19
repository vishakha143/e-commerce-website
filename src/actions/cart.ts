"use server";

import { auth } from "@/lib/auth";
import { mergeCart } from "@/services/cartService";
import type { CartItem } from "@/types/cart";

/**
 * Called once on login to fold the guest (localStorage) cart into
 * the user's persistent cart. Requires MONGODB_URI to be configured.
 */
export async function mergeCartAction(items: CartItem[]) {
  const session = await auth();
  if (!session?.user?.id || items.length === 0) return;

  await mergeCart(session.user.id, items);
}
