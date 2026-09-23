import Link from "next/link";
import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { listOrdersAdmin } from "@/services/orderService";

export const metadata: Metadata = {
  title: "Admin · Orders",
  robots: { index: false, follow: false },
};

interface OrderRow {
  id: string;
  customer: string;
  total: number;
  status: string;
  paymentStatus: string;
  tracking?: string;
  createdAt: string | Date;
}

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENTS = ["pending", "paid", "failed", "refunded"];

const controlClass =
  "px-3 py-2 border border-border rounded-md text-sm text-foreground bg-card focus:outline-none focus:border-foreground";

export default async function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = get("q") ?? "";
  const status = get("status") ?? "";
  const paymentStatus = get("payment") ?? "";
  const page = Number(get("page")) || 1;

  const result = await listOrdersAdmin({ q, status, paymentStatus, page });

  const rows: OrderRow[] = result.orders.map((doc) => {
    const user = doc.user as unknown as { name?: string; email?: string } | null;
    return {
      id: String(doc._id),
      customer: user?.name ?? user?.email ?? "Unknown",
      total: doc.total,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      tracking: doc.trackingReference,
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
    { header: "Payment", render: (o) => <span className="capitalize">{o.paymentStatus}</span> },
    { header: "Tracking", render: (o) => o.tracking || "—" },
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

  const filtered = Boolean(q || status || paymentStatus);
  const linkParams: Record<string, string | undefined> = {
    q: q || undefined,
    status: status || undefined,
    payment: paymentStatus || undefined,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <span className="text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "order" : "orders"}
          {filtered ? " match" : ""}
        </span>
      </div>

      <form action="/admin/orders" className="flex flex-wrap gap-2 items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder="Search order #, name or email"
          aria-label="Search orders"
          className={`${controlClass} flex-1 min-w-[200px]`}
        />
        <select name="status" defaultValue={status} aria-label="Filter by status" className={`${controlClass} capitalize`}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="payment" defaultValue={paymentStatus} aria-label="Filter by payment" className={`${controlClass} capitalize`}>
          <option value="">All payments</option>
          {PAYMENTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer"
        >
          FILTER
        </button>
        {filtered && (
          <Link href="/admin/orders" className="text-xs text-muted-foreground underline">
            Clear
          </Link>
        )}
      </form>

      <DataTable
        columns={columns}
        rows={rows}
        keyFor={(o) => o.id}
        emptyMessage={filtered ? "No orders match those filters." : "No orders yet."}
      />

      <Pagination
        basePath="/admin/orders"
        searchParams={linkParams}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
