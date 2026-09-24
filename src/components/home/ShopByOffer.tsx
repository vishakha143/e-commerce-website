import Link from "next/link";
import { SectionHeader } from "@/components/home/SectionHeader";

const OFFERS = [
  { eyebrow: "Under", title: "$60", sub: "Easy everyday buys", href: "/shop?maxPrice=60", bg: "bg-[#F3E9DF]" },
  { eyebrow: "Under", title: "$100", sub: "Elevated essentials", href: "/shop?maxPrice=100", bg: "bg-[#E8EDE6]" },
  { eyebrow: "The", title: "Sale", sub: "Marked-down favourites", href: "/shop?sale=true", bg: "bg-[#F6DDD5]" },
  { eyebrow: "Just", title: "In", sub: "Fresh this week", href: "/shop?isNew=true", bg: "bg-[#E4E7F0]" },
] as const;

export function ShopByOffer() {
  return (
    <section className="px-4 md:px-8 pt-14 max-w-[1600px] mx-auto w-full">
      <SectionHeader eyebrow="Find your fit" title="Shop by offer" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {OFFERS.map((o) => (
          <Link
            key={o.title}
            href={o.href}
            className={`group relative overflow-hidden rounded-xl ${o.bg} p-5 md:p-7 min-h-[132px] md:min-h-[168px] flex flex-col justify-between`}
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/60">
              {o.eyebrow.toUpperCase()}
            </span>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-foreground leading-none">{o.title}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-foreground/70">
                <span>{o.sub}</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
