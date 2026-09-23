import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/services/orderService";
import type { OrderItem } from "@/types/order";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#F5EEE0", color: "#8C6A2E" },
  confirmed: { bg: "#E7EDF5", color: "#3A5A8C" },
  processing: { bg: "#F5EEE0", color: "#8C6A2E" },
  shipped: { bg: "#E7EDF5", color: "#3A5A8C" },
  delivered: { bg: "#E7EFE9", color: "#3F6B4C" },
  cancelled: { bg: "#FCEFEC", color: "#8A5C50" },
};

export default async function OrderDetailPage(props: PageProps<"/account/orders/[id]">) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  let order;
  try {
    order = await getOrderById(id, session.user.id);
  } catch {
    order = null;
  }

  if (!order) notFound();

  const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
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
        <span
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
          style={{ backgroundColor: style.bg, color: style.color }}
        >
          {order.status}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Items</h2>
        {order.items.map((item: OrderItem, index: number) => (
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
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.pincode}
          <br />
          {order.shippingAddress.phone}
        </p>
      </div>

      <div className="flex flex-col gap-2 p-5 bg-card border border-border rounded-lg">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-sm text-[#2F6B3F]">
            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span>-${order.discount.toFixed(2)}</span>
          </div>
        )}
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
        {order.trackingReference && (
          <p className="text-xs text-foreground mt-1">Tracking: {order.trackingReference}</p>
        )}
      </div>
    </div>
  );
}
