import type { Metadata } from "next";
import { RevenueBarChart } from "@/components/admin/RevenueBarChart";
import { BarList } from "@/components/admin/BarList";
import { getRevenueSeries, getTopProducts, getSalesByCategory } from "@/services/adminService";

export const metadata: Metadata = {
  title: "Admin · Analytics",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  const [revenue, topProducts, salesByCategory] = await Promise.all([
    getRevenueSeries(30),
    getTopProducts(10),
    getSalesByCategory(),
  ]);

  const totalRevenue = revenue.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenue.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>

      <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-foreground">Revenue — Last 30 Days</h2>
          <span className="text-xs text-muted-foreground">
            ${totalRevenue.toFixed(2)} · {totalOrders} orders
          </span>
        </div>
        <RevenueBarChart data={revenue} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg">
          <h2 className="text-sm font-semibold text-foreground">Top Products</h2>
          <BarList
            items={topProducts.map((p) => ({ label: p.name, value: p.revenue }))}
            formatValue={(v) => `$${v.toFixed(2)}`}
            emptyMessage="No sales yet."
          />
        </div>

        <div className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg">
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
