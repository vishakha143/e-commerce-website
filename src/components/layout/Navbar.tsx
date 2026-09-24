"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Search, Heart, ShoppingBag, Menu } from "lucide-react";
import { BRAND_NAME, NAV_ITEMS } from "@/lib/constants";
import { CATEGORY_TREE } from "@/lib/categories";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { cn } from "@/lib/utils";

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

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold leading-4 text-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const openCartDrawer = useCartStore((s) => s.openDrawer);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-card/95 backdrop-blur border-b transition-shadow",
          scrolled
            ? "border-border shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            : "border-transparent",
        )}
      >
        <div className="relative flex items-center justify-between px-4 md:px-8 h-14 md:h-[68px] max-w-[1600px] mx-auto">
          {/* Mobile: menu left, logo centred, actions right (common D2C pattern). */}
          <button
            className="md:hidden cursor-pointer -ml-1 p-1"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Link
            href="/"
            className="font-display text-xl md:text-2xl font-bold tracking-[0.14em] text-foreground absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            {BRAND_NAME.toUpperCase()}
          </Link>

          <nav
            aria-label="Main"
            className="hidden md:flex items-stretch gap-1 h-full"
          >
            {NAV_ITEMS.map((item) => {
              const category = CATEGORY_TREE.find(
                (c) => item.href === `/category/${c.slug}`,
              );
              return (
                <div key={item.label} className="group flex items-stretch">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center px-3.5 text-[13px] font-medium tracking-wide text-foreground transition-colors",
                      "after:absolute after:left-3.5 after:right-3.5 after:bottom-[18px] after:h-px after:bg-foreground after:scale-x-0 after:origin-left after:transition-transform group-hover:after:scale-x-100 group-focus-within:after:scale-x-100",
                      item.label === "Sale" && "text-accent",
                      pathname === item.href.split("?")[0] &&
                        !item.href.includes("?") &&
                        "after:scale-x-100",
                      pathname.startsWith(item.href) &&
                        item.href.startsWith("/category/") &&
                        "after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>

                  {category && <MegaMenu category={category} />}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-5 text-foreground">
            <button
              type="button"
              aria-label="Search"
              className="cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={19} />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden md:block relative"
            >
              <Heart size={19} />
              <CountBadge count={wishlistCount} />
            </Link>
            <div className="hidden md:block">
              <AccountMenu />
            </div>
            <button
              type="button"
              aria-label={`Bag, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              onClick={openCartDrawer}
              className="relative cursor-pointer"
            >
              <ShoppingBag size={19} />
              <CountBadge count={cartCount} />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-blur would otherwise become the
        containing block for these position:fixed panels and squash them. */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
