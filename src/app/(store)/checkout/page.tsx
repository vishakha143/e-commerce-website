import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-[1200px] mx-auto w-full flex-1">
      <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
