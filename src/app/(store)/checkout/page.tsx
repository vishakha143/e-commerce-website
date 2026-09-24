import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-[1200px] mx-auto w-full flex-1">
      <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
      <ol className="mt-4 mb-8 flex items-center gap-2 text-xs font-medium" aria-label="Checkout steps">
        <li className="text-muted-foreground">Bag</li>
        <li aria-hidden className="text-muted-foreground">›</li>
        <li aria-current="step" className="font-semibold text-foreground underline underline-offset-8 decoration-2">
          Details &amp; payment
        </li>
        <li aria-hidden className="text-muted-foreground">›</li>
        <li className="text-muted-foreground">Confirmation</li>
      </ol>
      <CheckoutForm />
    </div>
  );
}
