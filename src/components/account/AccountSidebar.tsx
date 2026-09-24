"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UserRound,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAndClearLocalState } from "@/lib/clientAuth";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Profile", href: "/account", icon: UserRound },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="w-full md:w-[220px] shrink-0 flex flex-col gap-3">
      {isAdmin && (
        <Link
          href="/admin"
          className="hidden md:flex items-center gap-2.5 rounded-lg bg-gradient-to-br from-[#0F172A] to-[#4F46E5] px-3.5 py-3 text-white"
        >
          <ShieldCheck size={18} aria-hidden />
          <span className="text-sm font-semibold leading-tight">
            Admin console
            <span className="block text-[11px] font-normal text-indigo-200">Manage the store →</span>
          </span>
        </Link>
      )}

      <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={16} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:block h-px bg-border" />
      <button
        type="button"
        onClick={() => signOutAndClearLocalState({ callbackUrl: "/" })}
        className="hidden md:flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground text-left cursor-pointer"
      >
        <LogOut size={16} aria-hidden />
        Log out
      </button>
      <button
        type="button"
        onClick={() => signOutAndClearLocalState({ callbackUrl: "/" })}
        className="md:hidden self-start text-xs font-medium text-muted-foreground underline cursor-pointer"
      >
        Log out
      </button>
    </aside>
  );
}
