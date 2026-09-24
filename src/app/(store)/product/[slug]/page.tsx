import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { cn, safeJsonLd, buildBreadcrumbJsonLd } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getProductBySlug } from "@/services/productService";
import { findCategory, findSubcategory } from "@/lib/categories";
import { SITE_URL } from "@/lib/constants";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "@/lib/pricing";
import { Accordion } from "@/components/ui/Accordion";
import { Truck, RotateCcw, Banknote } from "lucide-react";

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  const description =
    product.description ??
    `${product.name} — $${product.price.toFixed(2)}. Shop ${product.category} essentials.`;

  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, type: "website" },
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = findCategory(product.category);
  const subcategory = product.subcategory
    ? findSubcategory(product.category, product.subcategory)
    : undefined;

  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const totalStock = product.variants.reduce(
    (sum: number, v: { stock: number }) => sum + v.stock,
    0,
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability:
        totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    ...(category ? [{ name: category.name, url: `${SITE_URL}/category/${category.slug}` }] : []),
    ...(subcategory
      ? [{ name: subcategory.name, url: `${SITE_URL}/category/${product.category}/${subcategory.slug}` }]
      : []),
    { name: product.name, url: `${SITE_URL}/product/${product.slug}` },
  ];

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />

      <p className="text-xs text-muted-foreground mb-4">
        <Link href="/">Home</Link>
        {category && (
          <>
            {" / "}
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
          </>
        )}
        {subcategory && (
          <>
            {" / "}
            <Link href={`/category/${product.category}/${subcategory.slug}`}>
              {subcategory.name}
            </Link>
          </>
        )}
        {` / ${product.name}`}
      </p>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-16">
        <ProductGallery product={product} />

        <div className="flex-1 flex flex-col gap-5 max-w-[480px] min-w-0">
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              <a href="#reviews" className="hover:underline">
                ★ {product.rating} ({product.reviewCount} reviews)
              </a>
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span
              className={cn(
                "text-xl font-bold",
                product.compareAtPrice ? "text-accent" : "text-foreground",
              )}
            >
              ${product.price}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-base text-[#A8A5A0] line-through">
                  ${product.compareAtPrice}
                </span>
                <span className="text-xs font-semibold text-accent">{discountPct}% OFF</span>
              </>
            )}
          </div>

          <ProductPurchasePanel product={product} />

          <ul className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
            <li className="flex flex-col items-center gap-1.5 rounded-lg bg-muted px-2 py-3">
              <Truck size={18} strokeWidth={1.6} aria-hidden />
              Free shipping ${FREE_SHIPPING_THRESHOLD}+
            </li>
            <li className="flex flex-col items-center gap-1.5 rounded-lg bg-muted px-2 py-3">
              <RotateCcw size={18} strokeWidth={1.6} aria-hidden />
              30-day returns
            </li>
            <li className="flex flex-col items-center gap-1.5 rounded-lg bg-muted px-2 py-3">
              <Banknote size={18} strokeWidth={1.6} aria-hidden />
              Cash on delivery
            </li>
          </ul>

          <div className="mt-1">
            {product.description && (
              <Accordion title="Description" defaultOpen>
                <p>{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.tags.map((tag: string) => (
                      <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-foreground/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Accordion>
            )}
            <Accordion title="Delivery & returns" defaultOpen={!product.description}>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Free delivery on orders over ${FREE_SHIPPING_THRESHOLD}; otherwise a flat ${STANDARD_SHIPPING_COST}.
                </li>
                <li>Easy returns within 30 days of delivery.</li>
                <li>Pay by cash on delivery when your order arrives.</li>
              </ul>
            </Accordion>
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} />

      <RelatedProducts product={product} />
    </div>
  );
}
