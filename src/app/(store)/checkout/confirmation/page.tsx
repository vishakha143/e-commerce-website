import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | Fashion",
};

export default async function CheckoutConfirmationPage(
  props: PageProps<"/checkout/confirmation">,
) {
  const { orderId } = await props.searchParams;
  const id = Array.isArray(orderId) ? orderId[0] : orderId;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[#E7EFE9] flex items-center justify-center text-[#3F6B4C] text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-foreground">Order Confirmed!</h1>
      {id && (
        <p className="text-sm text-muted-foreground">
          Order #{id.slice(-8).toUpperCase()}
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-sm">
        Thank you for your order. We&apos;ll send updates as it ships — you can
        track it anytime from your account.
      </p>
      <div className="flex gap-3 mt-2">
        <Link
          href="/account/orders"
          className="px-5 py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
        >
          VIEW ORDERS
        </Link>
        <Link
          href="/shop"
          className="px-5 py-3 border border-foreground text-foreground rounded-md text-xs font-semibold tracking-wide"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}
