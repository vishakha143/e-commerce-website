import Image from "next/image";
import Link from "next/link";

// The artwork has each label and "Shop …" button baked in, so tiles are image-only links.
const TILES = [
  { name: "Women", href: "/category/women", image: "/home/women.webp" },
  { name: "Men", href: "/category/men", image: "/home/men.webp" },
  { name: "Tops", href: "/category/women/tops", image: "/home/tops.webp" },
  { name: "Dresses", href: "/category/women/dresses", image: "/home/dresses.webp" },
] as const;

export function CategoryShowcase() {
  return (
    <section className="px-3 md:px-4 pt-3 md:pt-4 max-w-[1600px] mx-auto w-full">
      <h2 className="sr-only">Shop by category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.name}
            href={tile.href}
            aria-label={`Shop ${tile.name}`}
            className="group relative block aspect-[376/317] overflow-hidden rounded-xl"
          >
            <Image
              src={tile.image}
              alt={`${tile.name} collection`}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
