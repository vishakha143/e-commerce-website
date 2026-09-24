"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types/product";

export interface ProductTab {
  key: string;
  label: string;
  href: string;
  products: Product[];
}

/** Category tabs over a product grid (a common D2C home pattern). Data is fetched on the server. */
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Trending categories"
        className="flex gap-2 overflow-x-auto pb-1 mb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === current.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-colors cursor-pointer",
              t.key === current.key
                ? "bg-foreground text-background border-foreground"
                : "bg-card text-foreground border-border hover:border-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        <ProductGrid products={current.products} />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={current.href}
          className="px-8 py-3.5 border border-foreground text-foreground rounded-md text-xs font-semibold tracking-wide hover:bg-foreground hover:text-background transition-colors"
        >
          VIEW ALL {current.label.toUpperCase()}
        </Link>
      </div>
    </div>
  );
}
