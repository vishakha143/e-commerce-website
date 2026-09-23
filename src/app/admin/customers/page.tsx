import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { getAllUsers } from "@/services/userService";
import { getCustomerOrderStats } from "@/services/adminService";

export const metadata: Metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  role: string;
  orders: number;
  spent: number;
  createdAt: string | Date;
}

export default async function AdminCustomersPage() {
  const [docs, stats] = await Promise.all([getAllUsers(), getCustomerOrderStats()]);

  const rows: CustomerRow[] = docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    orders: stats.get(String(doc._id))?.orders ?? 0,
    spent: stats.get(String(doc._id))?.spent ?? 0,
    createdAt: doc.createdAt,
  }));

  const columns: Column<CustomerRow>[] = [
    { header: "Name", render: (c) => c.name },
    { header: "Email", render: (c) => c.email },
    { header: "Role", render: (c) => <span className="capitalize">{c.role}</span> },
    { header: "Orders", render: (c) => c.orders },
    { header: "Lifetime value", render: (c) => `$${c.spent.toFixed(2)}` },
    {
      header: "Joined",
      render: (c) =>
        new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">Customers</h1>
      <DataTable columns={columns} rows={rows} keyFor={(c) => c.id} emptyMessage="No customers yet." />
    </div>
  );
}
