"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { X } from "lucide-react";
import { BRAND_NAME, NAV_ITEMS } from "@/lib/constants";
import { Drawer } from "@/components/ui/Drawer";

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
  const { data: session } = useSession();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      widthClassName="w-[82%] max-w-xs"
      ariaLabel="Menu"
    >
      <div className="flex flex-col gap-4 p-5 overflow-y-auto">
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

        {session?.user ? (
          <div className="flex flex-col gap-1 text-sm font-medium text-foreground/80">
            {ACCOUNT_LINKS.map((link) => (
              <Link key={link.label} href={link.href} onClick={onClose}>
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="text-left cursor-pointer py-1"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-sm font-medium text-foreground/80">
            <Link href="/login" onClick={onClose}>
              Login
            </Link>
            <Link href="/register" onClick={onClose}>
              Create Account
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
