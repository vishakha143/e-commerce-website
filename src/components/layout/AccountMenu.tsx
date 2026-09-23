"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { signOutAndClearLocalState } from "@/lib/clientAuth";

const LINK = "px-4 py-2 text-sm text-foreground hover:bg-background";

/** Desktop account icon: a dropdown instead of a bare link, so signed-in users get options. */
export function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!session?.user) {
    return (
      <Link href="/login" aria-label="Log in">
        <User size={18} />
      </Link>
    );
  }

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer"
      >
        <User size={18} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-52 py-2 flex flex-col rounded-lg border border-border bg-card shadow-lg z-50"
        >
          <div className="px-4 pb-2 mb-1 border-b border-border">
            <div className="text-sm font-semibold text-foreground truncate">{session.user.name}</div>
            <div className="text-xs text-muted-foreground truncate">{session.user.email}</div>
          </div>
          <Link role="menuitem" href="/account" onClick={close} className={LINK}>
            My profile
          </Link>
          <Link role="menuitem" href="/account/orders" onClick={close} className={LINK}>
            Orders
          </Link>
          <Link role="menuitem" href="/wishlist" onClick={close} className={LINK}>
            Wishlist
          </Link>
          {session.user.role === "admin" && (
            <Link role="menuitem" href="/admin" onClick={close} className={LINK}>
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              close();
              signOutAndClearLocalState({ callbackUrl: "/" });
            }}
            className={`${LINK} text-left cursor-pointer border-t border-border mt-1 pt-2.5`}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
