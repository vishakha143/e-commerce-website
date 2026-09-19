import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const CATEGORIES = [
  { name: "Men", href: "/category/men" },
  { name: "Women", href: "/category/women" },
  { name: "Footwear", href: "/category/footwear" },
  { name: "Accessories", href: "/category/accessories" },
] as const;

export function CategoryShowcase() {
  return (
    <section className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-5">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="group relative aspect-[3/4] rounded-lg overflow-hidden"
          >
            <PlaceholderImage
              label={`category photo — ${cat.name}`}
              className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.015]"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent)]">
              <span className="text-white font-bold text-base">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
