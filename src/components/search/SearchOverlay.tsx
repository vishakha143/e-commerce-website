"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Modal } from "@/components/ui/Modal";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { getSuggestedProductsAction, searchSuggestionsAction } from "@/actions/product";
import type { Product } from "@/types/product";

const POPULAR_SEARCHES = ["T-Shirt", "Sneakers", "Polo", "Belt"];
const MIN_QUERY = 2;
const DEBOUNCE_MS = 250;

const RECENT_KEY = "recent-searches";
const MAX_RECENT = 5;

interface Suggestion {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  image?: string;
}

// Storage can be unavailable (private mode, blocked); recents are a
// convenience, so every access is wrapped and failures are ignored.
function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((t): t is string => typeof t === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(terms: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(terms));
  } catch {
    /* ignore */
  }
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggested, setSuggested] = useState<Product[]>([]);
  // Results are stored with the query they answer, so a slow response for an
  // older query can never be shown against newer text.
  const [live, setLive] = useState<{ q: string; items: Suggestion[] }>({ q: "", items: [] });
  // Bumped after writes so the derived `recent` list below re-reads storage.
  const [, setRecentVersion] = useState(0);
  const recent = open ? readRecent() : [];
  const latest = useRef("");

  const trimmed = query.trim();
  const searching = trimmed.length >= MIN_QUERY;
  const loading = searching && live.q !== trimmed;
  const liveItems = live.q === trimmed ? live.items : [];

  useEffect(() => {
    if (!open) return;
    getSuggestedProductsAction(3).then(setSuggested);
  }, [open]);

  useEffect(() => {
    if (!searching) return;
    latest.current = trimmed;
    const timer = setTimeout(() => {
      searchSuggestionsAction(trimmed)
        .then((items) => {
          if (latest.current === trimmed) setLive({ q: trimmed, items });
        })
        .catch(() => {
          if (latest.current === trimmed) setLive({ q: trimmed, items: [] });
        });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed, searching]);

  function submit(term: string) {
    const clean = term.trim().slice(0, 100);
    if (!clean) return;
    const next = [clean, ...readRecent().filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(
      0,
      MAX_RECENT,
    );
    writeRecent(next);
    setRecentVersion((v) => v + 1);
    onClose();
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Search">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-border">
        <div className="flex-1 flex items-center gap-2.5 bg-background border border-border rounded-lg px-4 py-3 focus-within:border-foreground">
          <Search size={16} className="text-muted-foreground shrink-0" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(query)}
            placeholder="Search for tees, sneakers, belts..."
            aria-label="Search for products"
            autoComplete="off"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-muted-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
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

      {searching ? (
        <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto" aria-live="polite">
          {loading ? (
            <p className="px-2 py-6 text-sm text-muted-foreground">Searching…</p>
          ) : liveItems.length > 0 ? (
            <>
              <ul className="flex flex-col">
                {liveItems.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 rounded-lg px-2 py-2.5 hover:bg-muted"
                    >
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-muted">
                        {item.image ? (
                          <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                        ) : (
                          <PlaceholderImage className="absolute inset-0" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{item.name}</div>
                        <div className="text-xs capitalize text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">${item.price}</div>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <div className="text-xs text-muted-foreground line-through">${item.compareAtPrice}</div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => submit(trimmed)}
                className="mt-3 w-full rounded-md border border-foreground py-3 text-xs font-semibold tracking-wide text-foreground cursor-pointer hover:bg-foreground hover:text-background transition-colors"
              >
                SEE ALL RESULTS FOR &ldquo;{trimmed.toUpperCase()}&rdquo;
              </button>
            </>
          ) : (
            <div className="px-2 py-6 text-sm text-muted-foreground">
              No matches for &ldquo;{trimmed}&rdquo;. Try another word, or{" "}
              <button
                type="button"
                onClick={() => submit(trimmed)}
                className="font-semibold text-foreground underline underline-offset-4 cursor-pointer"
              >
                search everything
              </button>
              .
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-9 p-7">
          <div className="w-full md:w-[220px] shrink-0 flex flex-col gap-6">
            {recent.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground">RECENT</span>
                  <button
                    type="button"
                    onClick={() => {
                      writeRecent([]);
                      setRecentVersion((v) => v + 1);
                    }}
                    className="text-xs text-muted-foreground underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recent.map((term) => (
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
            )}
            <div>
              <div className="text-xs font-semibold tracking-wide text-muted-foreground mb-2.5">POPULAR</div>
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
      )}
    </Modal>
  );
}
