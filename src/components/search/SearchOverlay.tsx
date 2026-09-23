"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Modal } from "@/components/ui/Modal";
import { getSuggestedProductsAction } from "@/actions/product";
import type { Product } from "@/types/product";

const POPULAR_SEARCHES = ["New Arrivals", "Denim", "Accessories", "Sale"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) return;
    getSuggestedProductsAction(3).then(setSuggested);
  }, [open]);

  function submit(term: string) {
    if (!term.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Search">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
        <div className="flex-1 flex items-center gap-2.5 bg-background border border-border rounded-lg px-4 py-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(query)}
            placeholder="Search for products..."
            aria-label="Search for products"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="cursor-pointer text-muted-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-9 p-7">
        <div className="w-full md:w-[220px] shrink-0">
          <div className="text-xs font-semibold tracking-wide text-muted-foreground mb-2.5">
            POPULAR
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => submit(term)}
                className="px-3 py-1.5 border border-border rounded-full text-xs text-foreground cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {suggested.length > 0 && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold tracking-wide text-muted-foreground mb-3.5">
              SUGGESTED PRODUCTS
            </div>
            <div
              className="grid grid-cols-3 gap-5"
              onClick={(e) => {
                // Close when a card link (image/name/select-options) is followed.
                if ((e.target as HTMLElement).closest("a")) onClose();
              }}
            >
              {suggested.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
