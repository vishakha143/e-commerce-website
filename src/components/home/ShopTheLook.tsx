import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function ShopTheLook() {
  return (
    <section className="relative h-[300px] flex items-center">
      <PlaceholderImage
        label="Editorial photo — head-to-toe outfit, concrete backdrop"
        className="absolute inset-0"
      />
      <div className="relative z-10 ml-auto px-6 md:px-14 text-right flex flex-col gap-3.5 items-end max-w-md">
        <h2 className="text-2xl md:text-[28px] font-bold leading-tight text-foreground">
          Good Outfits.
          <br />
          Brighter Days.
        </h2>
        <p className="text-sm text-foreground/70">Discover looks for every mood.</p>
        <Link
          href="/shop"
          className="px-5 py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
        >
          SHOP THE LOOK →
        </Link>
      </div>
    </section>
  );
}
