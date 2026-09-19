"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { mergeCartAction } from "@/actions/cart";
import { mergeWishlistAction } from "@/actions/wishlist";

/**
 * Folds the guest (localStorage) cart and wishlist into the DB-backed
 * ones once per sign-in. Best-effort: failures (e.g. MONGODB_URI not
 * yet configured) are swallowed so they never disrupt the UI.
 */
export function SyncOnLogin() {
  const { status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || syncedRef.current) return;
    syncedRef.current = true;

    const cartItems = useCartStore.getState().items;
    const wishlistIds = useWishlistStore.getState().ids;

    if (cartItems.length > 0) {
      mergeCartAction(cartItems).catch(() => {});
    }
    if (wishlistIds.length > 0) {
      mergeWishlistAction(wishlistIds).catch(() => {});
    }
  }, [status]);

  return null;
}
