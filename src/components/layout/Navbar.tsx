"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Heart, User, ShoppingBag, Menu } from "lucide-react";
import { BRAND_NAME, NAV_ITEMS } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";

// These overlays are present on every page via the Navbar but only ever
// matter once opened, and they (via Drawer/Modal) pull in the motion
// library — deferring them keeps that out of the initial JS payload.
const MobileNav = dynamic(() =>
  import("@/components/layout/MobileNav").then((m) => m.MobileNav),
);
const SearchOverlay = dynamic(() =>
  import("@/components/search/SearchOverlay").then((m) => m.SearchOverlay),
);
const CartDrawer = dynamic(() =>
  import("@/components/cart/CartDrawer").then((m) => m.CartDrawer),
);

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const openCartDrawer = useCartStore((s) => s.openDrawer);

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-[1600px] mx-auto">
        <Link href="/" className="text-lg font-extrabold tracking-wide">
          {BRAND_NAME.toUpperCase()}
        </Link>

        <nav className="hidden md:flex gap-7">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-foreground">
          <div className="hidden md:flex items-center gap-5">
            <button
              type="button"
              aria-label="Search"
              className="cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
            </button>
            <Link href="/wishlist" aria-label="Wishlist">
              <Heart size={18} />
            </Link>
            <Link href={session?.user ? "/account" : "/login"} aria-label="Account">
              <User size={18} />
            </Link>
          </div>

          <button
            type="button"
            aria-label="Bag"
            onClick={openCartDrawer}
            className="flex items-center gap-1.5 text-sm font-medium cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span>({cartCount})</span>
          </button>

          <button
            className="md:hidden cursor-pointer"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </header>
  );
}
