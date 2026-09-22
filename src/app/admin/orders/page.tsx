import Link from "next/link";
import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { getAllOrders } from "@/services/orderService";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

interface OrderRow {
  id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string | Date;
}

export default async function AdminOrdersPage() {
  const docs = await getAllOrders();

  const rows: OrderRow[] = docs.map((doc) => {
    const user = doc.user as unknown as { name?: string; email?: string } | null;
    return {
      id: String(doc._id),
      customer: user?.name ?? user?.email ?? "Unknown",
      total: doc.total,
      status: doc.status,
      createdAt: doc.createdAt,
    };
  });

  const columns: Column<OrderRow>[] = [
    { header: "Order", render: (o) => `#${o.id.slice(-8).toUpperCase()}` },
    { header: "Customer", render: (o) => o.customer },
    {
      header: "Date",
      render: (o) =>
        new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    { header: "Total", render: (o) => `$${o.total.toFixed(2)}` },
    { header: "Status", render: (o) => <span className="capitalize">{o.status}</span> },
    {
      header: "",
      render: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="text-xs font-medium text-foreground underline">
          View →
        </Link>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>
      <DataTable columns={columns} rows={rows} keyFor={(o) => o.id} emptyMessage="No orders yet." />
    </div>
  );
}
