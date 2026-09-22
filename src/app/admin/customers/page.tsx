import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { getAllUsers } from "@/services/userService";

export const metadata: Metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
}

export default async function AdminCustomersPage() {
  const docs = await getAllUsers();

  const rows: CustomerRow[] = docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    createdAt: doc.createdAt,
  }));

  const columns: Column<CustomerRow>[] = [
    { header: "Name", render: (c) => c.name },
    { header: "Email", render: (c) => c.email },
    { header: "Role", render: (c) => <span className="capitalize">{c.role}</span> },
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
