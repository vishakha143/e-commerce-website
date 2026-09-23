import Image from "next/image";
import Link from "next/link";

/** Banner artwork includes its own headline and "Explore looks" button. */
export function ShopTheLook() {
  return (
    <section className="px-3 md:px-4 py-3 md:py-4 max-w-[1600px] mx-auto w-full">
      <h2 className="sr-only">Shop the look — complete outfits for every occasion</h2>
      <Link
        href="/category/women"
        aria-label="Explore complete outfits"
        className="relative block h-[150px] sm:h-[210px] md:h-auto md:aspect-[1525/263] overflow-hidden rounded-xl"
      >
        <Image
          src="/home/look.webp"
          alt="Outfit flat-lays: casual day out, brunch ready, chic evenings"
          fill
          sizes="(min-width: 1600px) 1600px, 100vw"
          className="object-cover object-left md:object-center"
        />
      </Link>
    </section>
  );
}
