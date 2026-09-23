import Link from "next/link";
import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StockAdjustForm } from "@/components/admin/StockAdjustForm";
import { Pagination } from "@/components/ui/Pagination";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import {
  getInventorySummary,
  getRecentAdjustments,
  listInventory,
  type InventoryFilter,
  type InventoryRow,
} from "@/services/inventoryService";

export const metadata: Metadata = {
  title: "Admin · Inventory",
  robots: { index: false, follow: false },
};

const TABS: { key: InventoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
];

function stockBadge(stock: number) {
  // Text + colour, so state isn't conveyed by colour alone.
  if (stock <= 0) return { text: "Out of stock", cls: "bg-[#FCEFEC] text-[#7A3E33]" };
  if (stock <= LOW_STOCK_THRESHOLD) return { text: "Low stock", cls: "bg-[#FBF3DC] text-[#7A5B12]" };
  return { text: "In stock", cls: "bg-[#E8F1EA] text-[#2F6B3F]" };
}

export default async function AdminInventoryPage(props: PageProps<"/admin/inventory">) {
  const sp = await props.searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const filter = (["low", "out"].includes(get("filter") ?? "") ? get("filter") : "all") as InventoryFilter;
  const q = get("q") ?? "";
  const page = Number(get("page")) || 1;

  const [summary, result, adjustments] = await Promise.all([
    getInventorySummary(),
    listInventory({ filter, q, page }),
    getRecentAdjustments(10),
  ]);

  const columns: Column<InventoryRow>[] = [
    {
      header: "Product",
      render: (r) => (
        <Link href={`/admin/products/${r.productId}`} className="underline">
          {r.name}
        </Link>
      ),
    },
    { header: "Variant", render: (r) => [r.color, r.size].filter(Boolean).join(" · ") || "—" },
    { header: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { header: "Stock", render: (r) => <span className="font-semibold">{r.stock}</span> },
    {
      header: "Status",
      render: (r) => {
        const b = stockBadge(r.stock);
        return <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${b.cls}`}>{b.text}</span>;
      },
    },
    { header: "", render: (r) => <StockAdjustForm productId={r.productId} sku={r.sku} /> },
  ];

  const tabHref = (key: InventoryFilter) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("filter", key);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/admin/inventory?${qs}` : "/admin/inventory";
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Inventory</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Variants tracked", value: summary.variants },
          { label: "Units in stock", value: summary.units },
          { label: "Low stock", value: summary.low },
          { label: "Out of stock", value: summary.out },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-card border border-border rounded-lg">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-xl font-bold text-foreground mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Stock filter" className="flex gap-1.5">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={tabHref(t.key)}
              aria-current={filter === t.key ? "page" : undefined}
              className={
                filter === t.key
                  ? "px-3 py-1.5 rounded-md text-xs font-semibold bg-foreground text-background"
                  : "px-3 py-1.5 rounded-md text-xs font-medium border border-border text-foreground"
              }
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/inventory" className="flex gap-2 flex-1 min-w-[200px]">
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Search product or SKU"
            aria-label="Search inventory"
            className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-card focus:outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer"
          >
            SEARCH
          </button>
        </form>
      </div>

      <DataTable
        columns={columns}
        rows={result.rows}
        keyFor={(r) => `${r.productId}-${r.sku}`}
        emptyMessage={
          filter === "out"
            ? "Nothing is out of stock."
            : filter === "low"
              ? "Nothing is running low."
              : "No variants match."
        }
      />

      <Pagination
        basePath="/admin/inventory"
        searchParams={{ filter: filter === "all" ? undefined : filter, q: q || undefined }}
        page={result.page}
        totalPages={result.totalPages}
      />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Recent stock changes</h2>
        {adjustments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No manual adjustments yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border border border-border rounded-lg bg-card">
            {adjustments.map((a) => {
              const admin = a.admin as unknown as { name?: string } | null;
              return (
                <li key={String(a._id)} className="px-4 py-3 text-sm flex flex-wrap justify-between gap-2">
                  <span className="text-foreground">
                    <span className="font-medium">{a.productName}</span>{" "}
                    <span className="font-mono text-xs">{a.sku}</span>: {a.before} → {a.after}{" "}
                    <span className={a.delta > 0 ? "text-[#2F6B3F]" : "text-[#7A3E33]"}>
                      ({a.delta > 0 ? "+" : ""}
                      {a.delta})
                    </span>{" "}
                    <span className="capitalize text-muted-foreground">· {a.reason}</span>
                    {a.note ? <span className="text-muted-foreground"> · {a.note}</span> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {admin?.name ?? "Admin"} ·{" "}
                    {new Date(a.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
