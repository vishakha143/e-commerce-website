import Image from "next/image";
import Link from "next/link";

/**
 * The campaign artwork carries its own headline and "Shop now" button, so the
 * whole banner is one link. On phones the wide banner is cropped from the
 * left, which keeps the headline and button in frame.
 */
export function Hero() {
  return (
    <section className="px-3 md:px-4 pt-3 md:pt-4 max-w-[1600px] mx-auto w-full">
      <h1 className="sr-only">Style Your Story — trendy looks for every you</h1>
      <Link
        href="/shop"
        aria-label="Shop the new season collection"
        className="relative block h-[220px] sm:h-[300px] md:h-auto md:aspect-[1525/422] overflow-hidden rounded-xl"
      >
        <Image
          src="/home/hero.webp"
          alt="Woman in a floral dress in the sun — Style Your Story, new season"
          fill
          priority
          sizes="(min-width: 1600px) 1600px, 100vw"
          className="object-cover object-left md:object-center"
        />
      </Link>
    </section>
  );
}
