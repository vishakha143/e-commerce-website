import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { getOrderByIdAdmin } from "@/services/orderService";
import type { OrderItem, OrderStatus } from "@/types/order";

export const metadata: Metadata = {
  title: "Admin · Order Details",
  robots: { index: false, follow: false },
};

export default async function AdminOrderDetailPage(props: PageProps<"/admin/orders/[id]">) {
  const { id } = await props.params;
  const order = await getOrderByIdAdmin(id);
  if (!order) notFound();

  const customer = order.user as unknown as { name?: string; email?: string } | null;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 max-w-[640px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">
            Order #{String(order._id).slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Placed {date}</p>
        </div>
        <OrderStatusSelect orderId={String(order._id)} status={order.status as OrderStatus} />
      </div>

      <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-lg">
        <h2 className="text-sm font-semibold text-foreground mb-1">Customer</h2>
        <p className="text-sm text-muted-foreground">
          {customer?.name}
          <br />
          {customer?.email}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Items</h2>
        {(order.items as OrderItem[]).map((item, index) => (
          <div
            key={`${item.sku}-${index}`}
            className="flex justify-between text-sm border-b border-border pb-3"
          >
            <div>
              <div className="font-medium text-foreground">{item.name}</div>
              <div className="text-xs text-muted-foreground">
                {[item.color, item.size].filter(Boolean).join(" · ")} · Qty {item.quantity}
              </div>
            </div>
            <span className="font-semibold text-foreground shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-lg">
        <h2 className="text-sm font-semibold text-foreground mb-1">Shipping Address</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {order.shippingAddress.name}
          <br />
          {order.shippingAddress.address}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
          <br />
          {order.shippingAddress.phone}
        </p>
      </div>

      <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-lg">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Shipping</span>
          <span>{order.shippingCost === 0 ? "Free" : `$${order.shippingCost.toFixed(2)}`}</span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex justify-between text-base font-bold text-foreground">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Payment: Cash on Delivery · {order.paymentStatus}
        </p>
      </div>
    </div>
  );
}
