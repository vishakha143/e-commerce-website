import Link from "next/link";
import type { Metadata } from "next";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Shipping, returns, payments and answers to common questions.",
  alternates: { canonical: "/help" },
};

const FAQ = [
  {
    q: "How can I pay?",
    a: "Cash on delivery: you pay when your order arrives. No card details are needed at checkout.",
  },
  {
    q: "How much is shipping?",
    a: `Shipping is free on orders of $${FREE_SHIPPING_THRESHOLD} and over, and $${STANDARD_SHIPPING_COST} on smaller orders. Discount codes don't change whether you qualify for free shipping.`,
  },
  {
    q: "Can I use a promo code?",
    a: "Yes. Enter your code in the order summary at checkout and click Apply. Each code can be used once per customer.",
  },
  {
    q: "How do I track my order?",
    a: "Open Orders in your account. Once your order ships, the courier and tracking number appear on the order page.",
  },
  {
    q: "Can I review a product?",
    a: "Yes, once your order for it has been delivered, write a review on the product page.",
  },
];

export default function HelpPage() {
  return (
    <div className="px-4 md:px-8 py-10 md:py-14 max-w-[820px] mx-auto w-full">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Help &amp; FAQ</h1>
      <p className="mt-2 text-muted-foreground">Everything you need to know about ordering with us.</p>

      <div className="mt-10 flex flex-col gap-10">
        <section id="shipping" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-foreground">Shipping</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Orders over ${FREE_SHIPPING_THRESHOLD} ship free. Below that, shipping is a flat $
            {STANDARD_SHIPPING_COST}. You&apos;ll see the exact total before you place your order.
          </p>
        </section>

        <section id="returns" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-foreground">Returns</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Changed your mind or the fit isn&apos;t right? Returns are easy within 30 days of delivery.
          </p>
        </section>

        <section id="payments" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-foreground">Payments</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We currently accept cash on delivery. You pay the courier when your order arrives.
          </p>
        </section>

        <section id="faq" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-semibold text-foreground">Frequently asked questions</h2>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-foreground">
                  {item.q}
                  <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Ready to shop?{" "}
        <Link href="/shop" className="font-semibold text-foreground underline underline-offset-4">
          Browse the collection
        </Link>
      </p>
    </div>
  );
}
