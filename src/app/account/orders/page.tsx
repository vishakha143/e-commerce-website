import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getOrdersByUserId } from "@/services/orderService";
import { OrderCard, type OrderCardData } from "@/components/account/OrderCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await auth();
  let orders: OrderCardData[] = [];

  // A read failure here (most likely MONGODB_URI not configured yet)
  // degrades to the empty state below rather than breaking the page.
  try {
    if (session?.user?.id) {
      const docs = await getOrdersByUserId(session.user.id);
      orders = docs.map((doc) => ({
        id: String(doc._id),
        itemCount: doc.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        total: doc.total,
        status: doc.status,
        createdAt: doc.createdAt,
      }));
    }
  } catch {
    orders = [];
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-foreground">My Orders</h1>
      {orders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-lg">
          <EmptyState
            title="No orders yet"
            description="Your order history will show up here once you place an order."
          />
        </div>
      )}
    </div>
  );
}
