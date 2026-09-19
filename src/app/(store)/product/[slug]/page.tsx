import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getProductBySlug } from "@/lib/mock-products";
import { findCategory, findSubcategory } from "@/lib/categories";

export async function generateMetadata(
  props: PageProps<"/product/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  return { title: product ? `${product.name} | Fashion` : "Product | Fashion" };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = findCategory(product.category);
  const subcategory = product.subcategory
    ? findSubcategory(product.category, product.subcategory)
    : undefined;

  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
      <p className="text-xs text-muted-foreground mb-4">
        Home{category ? ` / ${category.name}` : ""}
        {subcategory ? ` / ${subcategory.name}` : ""} / {product.name}
      </p>

      <div className="flex flex-col md:flex-row gap-11">
        <ProductGallery product={product} />

        <div className="flex-1 flex flex-col gap-[18px] max-w-[420px] min-w-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              ★ {product.rating} ({product.reviewCount} reviews)
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

          <div className="flex flex-col gap-2 pt-2 border-t border-border text-sm text-muted-foreground">
            <div>Free delivery on orders over $150</div>
            <div>30-day easy returns</div>
            <div>Secure checkout · Cash on delivery available</div>
          </div>

          {product.description && (
            <div className="border-t border-border pt-4">
              <div className="text-sm font-semibold text-foreground mb-2">Description</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <RelatedProducts product={product} />
    </div>
  );
}
