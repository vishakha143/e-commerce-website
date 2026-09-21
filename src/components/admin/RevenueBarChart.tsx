import type { DailyRevenue } from "@/services/adminService";

export function RevenueBarChart({ data }: { data: DailyRevenue[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));

  return (
    <div className="flex items-end gap-2 h-[160px]">
      {data.map((d) => {
        const heightPct = Math.max(2, (d.revenue / max) * 100);
        const label = new Date(`${d.date}T00:00:00`).toLocaleDateString("en-US", {
          weekday: "short",
        });
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
            title={`${d.date}: $${d.revenue.toFixed(2)} (${d.orders} orders)`}
          >
            <div
              className="w-full rounded-t bg-foreground"
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
