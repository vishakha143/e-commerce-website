"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { syncUserStateAction } from "@/actions/sync";

/**
 * Once per sign-in, folds the guest (localStorage) cart and wishlist into
 * the user's persistent ones, then replaces the local stores with the
 * resulting DB state — so a user logging in on a fresh browser/device sees
 * whatever they'd already saved, not just whatever was sitting in this
 * browser's storage. Best-effort: failures (e.g. MONGODB_URI not yet
 * configured) are swallowed so they never disrupt the UI.
 */
export function SyncOnLogin() {
  const { status } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || syncedRef.current) return;
    syncedRef.current = true;

    const cartItems = useCartStore.getState().items;
    const wishlistIds = useWishlistStore.getState().ids;

    syncUserStateAction(cartItems, wishlistIds)
      .then((result) => {
        if (!result) return;
        useCartStore.setState({ items: result.cartItems });
        useWishlistStore.setState({ ids: result.wishlistIds });
      })
      .catch(() => {});
  }, [status]);

  return null;
}
