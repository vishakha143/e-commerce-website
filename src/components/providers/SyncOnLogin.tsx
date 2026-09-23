"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { syncUserStateAction, saveCartAction, fetchCartAction } from "@/actions/sync";
import type { CartItem } from "@/types/cart";

const PUSH_DELAY_MS = 1500;

const sameCart = (a: CartItem[], b: CartItem[]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Keeps the cart and wishlist in step with the account.
 *
 * Once per sign-in: folds the guest (localStorage) cart and wishlist into the
 * user's persistent ones, then replaces the local stores with the DB state, so
 * a fresh browser sees what was already saved.
 *
 * After that, while signed in: local cart edits are pushed to the account
 * (debounced), and when a background tab becomes visible again it pulls the
 * account cart, so edits made on another device show up without a re-login.
 * Nothing is pushed until the initial sync has finished, otherwise an empty
 * local cart could overwrite a saved one. Best-effort: failures are swallowed
 * so they never disrupt the UI.
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

  useEffect(() => {
    if (status !== "authenticated") return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;
    let dirty = false;
    let lastSaved: CartItem[] | null = null;

    // Wait for the login sync above to land before treating changes as edits.
    const readyTimer = setTimeout(() => {
      ready = true;
      lastSaved = useCartStore.getState().items;
    }, 2500);

    const unsubscribe = useCartStore.subscribe((state, prev) => {
      if (!ready || state.items === prev.items) return;
      if (lastSaved && sameCart(state.items, lastSaved)) return;
      dirty = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const items = useCartStore.getState().items;
        saveCartAction(items)
          .then((res) => {
            if (res.ok) lastSaved = items;
          })
          .catch(() => {})
          .finally(() => {
            dirty = false;
          });
      }, PUSH_DELAY_MS);
    });

    function pull() {
      if (document.visibilityState !== "visible" || !ready || dirty) return;
      fetchCartAction()
        .then((items) => {
          if (!items || dirty) return;
          if (!sameCart(items, useCartStore.getState().items)) {
            lastSaved = items;
            useCartStore.setState({ items });
          }
        })
        .catch(() => {});
    }
    document.addEventListener("visibilitychange", pull);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener("visibilitychange", pull);
    };
  }, [status]);

  return null;
}
