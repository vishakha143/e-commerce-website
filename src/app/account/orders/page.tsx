import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "My Orders | Fashion",
};

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-foreground">My Orders</h1>
      <div className="border border-dashed border-border rounded-lg">
        <EmptyState
          title="No orders yet"
          description="Your order history will show up here once checkout is available."
        />
      </div>
    </div>
  );
}
