"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Ticket,
  FolderTree,
  Star,
  BarChart3,
  UserCircle,
  ExternalLink,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAndClearLocalState } from "@/lib/clientAuth";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Profile", href: "/admin/profile", icon: UserCircle },
];

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="md:w-[248px] shrink-0 bg-[#0F172A] text-slate-300 md:min-h-screen md:sticky md:top-0 md:self-start md:h-screen flex flex-col">
      <div className="flex items-center justify-between md:block px-5 pt-5 pb-3 md:pb-5">
        <div>
          <div className="text-[17px] font-extrabold tracking-wide text-white">FASHION</div>
          <span className="mt-1 inline-block rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-indigo-300">
            ADMIN CONSOLE
          </span>
        </div>
        <Link href="/" className="md:hidden text-xs font-medium text-slate-400">
          View store ↗
        </Link>
      </div>

      <nav className="flex md:flex-col gap-1 px-3 pb-3 overflow-x-auto md:overflow-y-auto md:flex-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-500 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={16} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex flex-col gap-2 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white"
          >
            {(name || email || "A").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{name || "Admin"}</div>
            <div className="truncate text-xs text-slate-400">{email}</div>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium text-slate-400 hover:text-white"
        >
          <ExternalLink size={14} aria-hidden /> View store
        </Link>
        <button
          type="button"
          onClick={() => signOutAndClearLocalState({ callbackUrl: "/" })}
          className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
        >
          <LogOut size={14} aria-hidden /> Log out
        </button>
      </div>
    </aside>
  );
}
