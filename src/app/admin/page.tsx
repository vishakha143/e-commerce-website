import type { Metadata } from "next";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueBarChart } from "@/components/admin/RevenueBarChart";
import { BarList } from "@/components/admin/BarList";
import {
  getDashboardStats,
  getRevenueSeries,
  getTopProducts,
  getSalesByCategory,
} from "@/services/adminService";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [stats, revenue, topProducts, salesByCategory] = await Promise.all([
    getDashboardStats(),
    getRevenueSeries(7),
    getTopProducts(5),
    getSalesByCategory(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
        <StatsCard label="Total Orders" value={stats.totalOrders.toString()} />
        <StatsCard label="Total Customers" value={stats.totalCustomers.toString()} />
        <StatsCard label="Total Products" value={stats.totalProducts.toString()} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg">
          <h2 className="text-sm font-semibold text-foreground">Revenue — Last 7 Days</h2>
          <RevenueBarChart data={revenue} />
        </div>

        <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg">
          <h2 className="text-sm font-semibold text-foreground">Top Products</h2>
          <BarList
            items={topProducts.map((p) => ({ label: p.name, value: p.revenue }))}
            formatValue={(v) => `$${v.toFixed(2)}`}
            emptyMessage="No sales yet."
          />
        </div>

        <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg md:col-span-2">
          <h2 className="text-sm font-semibold text-foreground">Sales by Category</h2>
          <BarList
            items={salesByCategory.map((c) => ({ label: c.category, value: c.revenue }))}
            formatValue={(v) => `$${v.toFixed(2)}`}
            emptyMessage="No sales yet."
          />
        </div>
      </div>
    </div>
  );
}
