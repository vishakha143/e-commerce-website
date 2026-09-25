import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  if (session?.user?.role === "admin") {
    return (
      <div className="px-4 md:px-8 py-16 max-w-[560px] mx-auto w-full flex-1 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout isn&apos;t available for admins</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The admin account manages the store and doesn&apos;t place orders. To test checkout, sign in with a
          customer account.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-md bg-foreground px-6 py-3 text-xs font-semibold tracking-wide text-background"
        >
          GO TO ADMIN CONSOLE
        </Link>
      </div>
    );
  }

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
