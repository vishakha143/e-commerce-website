import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function Hero() {
  return (
    <section className="relative h-[420px] md:h-[540px] flex items-end">
      <PlaceholderImage
        label="Campaign photo — two models in oversized tee & denim, studio wall"
        className="absolute inset-0"
      />
      <div className="relative z-10 flex flex-col gap-4 max-w-xl p-6 md:p-12">
        <p className="text-xs font-semibold tracking-[0.12em] text-foreground">
          NEW COLLECTION
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.05] text-foreground">
          EVERYDAY.
          <br />
          YOUR WAY.
        </h1>
        <p className="text-sm md:text-[15px] text-foreground/70">
          Modern essentials for a better you.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/category/men"
            className="px-6 py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
          >
            SHOP MEN
          </Link>
          <Link
            href="/category/women"
            className="px-6 py-3.5 bg-card text-foreground border border-foreground rounded-md text-xs font-semibold tracking-wide"
          >
            SHOP WOMEN
          </Link>
        </div>
      </div>
    </section>
  );
}
