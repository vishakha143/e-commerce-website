"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { BRAND_NAME, NAV_ITEMS } from "@/lib/constants";
import { Drawer } from "@/components/ui/Drawer";
import { signOutAndClearLocalState } from "@/lib/clientAuth";

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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-background p-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background"
              >
                {(session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  Hi, {session.user.name?.split(" ")[0] ?? "there"}
                </div>
                <div className="truncate text-xs text-muted-foreground">{session.user.email}</div>
              </div>
            </div>
            <div className="flex flex-col text-sm font-medium text-foreground/80">
              {ACCOUNT_LINKS.map((link) => (
                <Link key={link.label} href={link.href} onClick={onClose} className="py-2">
                  {link.label}
                </Link>
              ))}
              {session.user.role === "admin" && (
                <Link href="/admin" onClick={onClose} className="py-2 text-foreground">
                  Admin dashboard →
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                signOutAndClearLocalState({ callbackUrl: "/" });
              }}
              className="rounded-md border border-border py-2.5 text-xs font-semibold tracking-wide cursor-pointer"
            >
              LOG OUT
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl bg-background p-4">
            <div>
              <div className="text-base font-bold text-foreground">Your style, your account</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Save favourites, check out faster and follow every order from bag to doorstep.
              </p>
            </div>
            <Link
              href="/login"
              onClick={onClose}
              className="rounded-md bg-foreground py-3 text-center text-xs font-semibold tracking-wide text-background"
            >
              SIGN IN
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="rounded-md border border-foreground py-3 text-center text-xs font-semibold tracking-wide text-foreground"
            >
              JOIN FASHION — IT&apos;S FREE
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}
