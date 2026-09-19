"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { BRAND_NAME, NAV_ITEMS } from "@/lib/constants";

const ACCOUNT_LINKS = [
  { label: "Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Help & Support", href: "/help" },
] as const;

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-foreground/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-card flex flex-col gap-4 p-5 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-wide">
            {BRAND_NAME.toUpperCase()}
          </span>
          <button aria-label="Close menu" onClick={onClose} className="cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <Link
          href="/search"
          onClick={onClose}
          className="rounded-md border border-border px-3.5 py-2.5 text-sm text-muted-foreground"
        >
          Search products...
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="py-2 text-[15px] font-medium text-foreground"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-1 text-sm font-medium text-foreground/80">
          {ACCOUNT_LINKS.map((link) => (
            <Link key={link.label} href={link.href} onClick={onClose}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
