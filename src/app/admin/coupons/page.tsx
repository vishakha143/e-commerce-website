import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { CouponForm } from "@/components/admin/CouponForm";
import { CouponRowActions } from "@/components/admin/CouponRowActions";
import { listCoupons, type CouponDoc } from "@/services/couponService";

export const metadata: Metadata = {
  title: "Admin · Coupons",
  robots: { index: false, follow: false },
};

function status(c: CouponDoc) {
  if (!c.active) return { text: "Disabled", cls: "bg-muted text-muted-foreground" };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) {
    return { text: "Expired", cls: "bg-[#FCEFEC] text-[#7A3E33]" };
  }
  if (c.maxUses !== null && c.usedCount >= c.maxUses) {
    return { text: "Used up", cls: "bg-[#FBF3DC] text-[#7A5B12]" };
  }
  return { text: "Active", cls: "bg-[#E8F1EA] text-[#2F6B3F]" };
}

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  const columns: Column<CouponDoc>[] = [
    { header: "Code", render: (c) => <span className="font-mono font-semibold">{c.code}</span> },
    {
      header: "Discount",
      render: (c) => (c.type === "percent" ? `${c.value}% off` : `$${c.value.toFixed(2)} off`),
    },
    { header: "Min spend", render: (c) => (c.minSubtotal > 0 ? `$${c.minSubtotal.toFixed(2)}` : "—") },
    { header: "Used", render: (c) => (c.maxUses !== null ? `${c.usedCount} / ${c.maxUses}` : c.usedCount) },
    {
      header: "Expires",
      render: (c) =>
        c.expiresAt
          ? new Date(c.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "Never",
    },
    {
      header: "Status",
      render: (c) => {
        const s = status(c);
        return <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${s.cls}`}>{s.text}</span>;
      },
    },
    {
      header: "",
      render: (c) => <CouponRowActions id={String(c._id)} active={c.active} />,
      className: "text-right",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <CouponForm />
        <div className="flex-1 min-w-0 w-full">
          <DataTable
            columns={columns}
            rows={coupons}
            keyFor={(c) => String(c._id)}
            emptyMessage="No coupons yet."
          />
        </div>
      </div>
    </div>
  );
}
