import Link from "next/link";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#F5EEE0", color: "#8C6A2E" },
  confirmed: { bg: "#E7EDF5", color: "#3A5A8C" },
  processing: { bg: "#F5EEE0", color: "#8C6A2E" },
  shipped: { bg: "#E7EDF5", color: "#3A5A8C" },
  delivered: { bg: "#E7EFE9", color: "#3F6B4C" },
  cancelled: { bg: "#FCEFEC", color: "#8A5C50" },
};

export interface OrderCardData {
  id: string;
  itemCount: number;
  total: number;
  status: string;
  createdAt: string | Date;
}

export function OrderCard({ order }: { order: OrderCardData }) {
  const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg bg-card flex-wrap">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">
          #{order.id.slice(-8).toUpperCase()}
        </span>
        <span className="text-xs text-muted-foreground">
          {order.itemCount} items · {date}
        </span>
      </div>
      <span className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</span>
      <span
        className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {order.status}
      </span>
      <Link
        href={`/account/orders/${order.id}`}
        className="text-xs font-medium text-foreground underline"
      >
        View Details →
      </Link>
    </div>
  );
}
