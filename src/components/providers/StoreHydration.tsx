"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Cart/wishlist stores use skipHydration so the server render and the
 * client's first render both start from the default (empty) state —
 * avoiding a hydration mismatch. This pulls the real localStorage
 * state in right after mount.
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  return null;
}
