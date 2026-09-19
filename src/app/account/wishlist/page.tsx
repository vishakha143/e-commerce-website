import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "My Wishlist | Fashion",
};

export default function AccountWishlistPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-foreground">Wishlist</h1>
      <div className="border border-dashed border-border rounded-lg">
        <EmptyState
          title="Nothing saved yet"
          description="A persistent wishlist is coming in a later phase — save products you love and find them here."
        />
      </div>
    </div>
  );
}
