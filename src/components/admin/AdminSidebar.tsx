"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "Analytics", href: "/admin/analytics" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-[200px] shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-2.5 py-2.5 rounded-md text-sm font-medium whitespace-nowrap",
              active ? "text-foreground bg-background" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <div className="hidden md:block h-px bg-border my-2.5" />
      <Link
        href="/"
        className="px-2.5 py-2.5 text-sm font-medium text-muted-foreground whitespace-nowrap"
      >
        ← Back to Store
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-2.5 py-2.5 text-sm font-medium text-muted-foreground text-left cursor-pointer whitespace-nowrap"
      >
        Logout
      </button>
    </aside>
  );
}
