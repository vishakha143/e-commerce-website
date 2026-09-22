import type { Metadata } from "next";
import { WishlistPreview } from "@/components/account/WishlistPreview";

export const metadata: Metadata = {
  title: "My Wishlist",
  robots: { index: false, follow: false },
};

export default function AccountWishlistPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-foreground">Wishlist</h1>
      <WishlistPreview />
    </div>
  );
}
