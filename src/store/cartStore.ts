import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  incrementItem: (sku: string) => void;
  decrementItem: (sku: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.sku === item.sku);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === item.sku ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        }),

      removeItem: (sku) =>
        set((state) => ({ items: state.items.filter((i) => i.sku !== sku) })),

      incrementItem: (sku) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        })),

      decrementItem: (sku) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.sku === sku ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
