"use client";

import { signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Wraps next-auth's signOut() to first clear the client-persisted cart and
 * wishlist. Both are a single shared localStorage key with no per-user
 * scoping, so without this, the next person to use the browser — a
 * different account, or a guest — would see, and on their own next login
 * merge into their own account, whatever the previous user left behind.
 */
export function signOutAndClearLocalState(options?: Parameters<typeof signOut>[0]) {
  useCartStore.getState().clear();
  useWishlistStore.getState().clear();
  return signOut(options);
}
