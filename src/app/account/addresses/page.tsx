import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "My Addresses",
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-foreground">Saved Addresses</h1>
      <div className="border border-dashed border-border rounded-lg">
        <EmptyState
          title="No saved addresses yet"
          description="You'll be able to add and manage addresses during checkout."
        />
      </div>
    </div>
  );
}
