"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Search, Heart, User, ShoppingBag, Menu } from "lucide-react";
import { BRAND_NAME, NAV_ITEMS } from "@/lib/constants";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = 0;

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

        <div className="hidden md:flex items-center gap-5 text-foreground">
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
          <Link href="/cart" aria-label="Bag" className="flex items-center gap-1.5 text-sm font-medium">
            <ShoppingBag size={18} />
            <span>({cartCount})</span>
          </Link>
        </div>

        <button
          className="md:hidden cursor-pointer"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
