import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryNode } from "@/types/category";

// Campaign artwork already on the site; anything not listed gets a tinted tile.
const TILE_IMAGES: Record<string, string> = {
  women: "/home/women.webp",
  men: "/home/men.webp",
  "women/tops": "/home/tops.webp",
  "women/dresses": "/home/dresses.webp",
};

const TINTS = ["bg-[#F3E9DF]", "bg-[#E8EDE6]", "bg-[#F6DDD5]", "bg-[#E4E7F0]"];

/** Hover panel under a top-level nav item: subcategory tiles, quick links and a shop-all CTA. */
export function MegaMenu({ category }: { category: CategoryNode }) {
  const base = `/category/${category.slug}`;
  const subs = category.children ?? [];

  return (
    <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 absolute left-0 right-0 top-full bg-card border-t border-border border-b shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1600px] mx-auto px-8 py-8 grid grid-cols-[240px_1fr] gap-12">
        <div className="flex flex-col">
          <div className="text-[11px] font-semibold tracking-[0.18em] text-accent">SHOP</div>
          <div className="font-display text-3xl font-bold text-foreground mt-1">{category.name}</div>

          <ul className="mt-5 flex flex-col">
            {subs.map((sub) => (
              <li key={sub.slug}>
                <Link
                  href={`${base}/${sub.slug}`}
                  className="group/link flex items-center justify-between border-b border-border py-2.5 text-sm text-foreground hover:text-accent transition-colors"
                >
                  {sub.name}
                  <ArrowRight
                    size={14}
                    className="opacity-0 -translate-x-1 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-2 text-sm">
            <Link href={`${base}?isNew=true`} className="text-foreground/80 hover:text-foreground">
              New in {category.name}
            </Link>
            <Link href={`${base}?sale=true`} className="text-accent hover:underline underline-offset-4">
              {category.name} sale
            </Link>
          </div>

          <Link
            href={base}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 text-xs font-semibold tracking-wide text-background"
          >
            SHOP ALL {category.name.toUpperCase()} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 content-start">
          {subs.length === 0 && TILE_IMAGES[category.slug] && (
            <Link href={base} className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-xl">
              <Image src={TILE_IMAGES[category.slug]} alt={`Shop ${category.name}`} fill sizes="480px" className="object-cover" />
            </Link>
          )}
          {subs.map((sub, i) => {
            const image = TILE_IMAGES[`${category.slug}/${sub.slug}`];
            return (
              <Link
                key={sub.slug}
                href={`${base}/${sub.slug}`}
                className={`group/tile relative aspect-[4/5] overflow-hidden rounded-xl ${image ? "bg-muted" : TINTS[i % TINTS.length]}`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`${sub.name} in ${category.name}`}
                    fill
                    sizes="(min-width: 1024px) 18vw, 30vw"
                    // The artwork has its own caption along the bottom; zoom from the top so it is cropped out.
                    className="object-cover object-top origin-top scale-[1.55] transition-transform duration-500 group-hover/tile:scale-[1.62]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center font-display text-6xl font-bold text-foreground/10"
                  >
                    {sub.name.charAt(0)}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/45 to-transparent px-4 pb-3 pt-10 text-sm font-semibold text-white">
                  {sub.name}
                  <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
