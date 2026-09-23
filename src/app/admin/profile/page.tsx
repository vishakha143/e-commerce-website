import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAttentionCounts, getDashboardStats } from "@/services/adminService";

export const metadata: Metadata = {
  title: "Admin · Profile",
  robots: { index: false, follow: false },
};

const QUICK_ACTIONS = [
  { label: "Add a product", href: "/admin/products/new" },
  { label: "Process orders", href: "/admin/orders?status=pending" },
  { label: "Restock inventory", href: "/admin/inventory?filter=low" },
  { label: "Create a coupon", href: "/admin/coupons" },
] as const;

export default async function AdminProfilePage() {
  const session = await auth();
  await connectDB();
  const user = session?.user?.id
    ? await User.findById(session.user.id).select("name email createdAt").lean<{
        name: string;
        email: string;
        createdAt: Date;
      }>()
    : null;

  const [attention, stats] = await Promise.all([getAttentionCounts(), getDashboardStats()]);

  const name = user?.name ?? session?.user?.name ?? "Admin";
  const email = user?.email ?? session?.user?.email ?? "";
  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";
  const hour = new Date().getUTCHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const todo = [
    { label: "Orders waiting", value: attention.pendingOrders },
    { label: "Low-stock variants", value: attention.lowStock },
    { label: "Out of stock", value: attention.outOfStock },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#312E81] to-[#4F46E5] p-6 md:p-8 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <span
            aria-hidden
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-extrabold ring-1 ring-white/30"
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-indigo-200">{greeting},</p>
            <h1 className="truncate text-2xl md:text-3xl font-extrabold">{name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1 font-semibold tracking-wide">
                STORE ADMINISTRATOR
              </span>
              <span className="text-indigo-200">{email}</span>
              <span className="text-indigo-200">· Admin since {since}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {todo.map((t) => (
          <div key={t.label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.label}
            </div>
            <div className="mt-1 text-3xl font-bold text-foreground">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-md border border-border px-3 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Store at a glance</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Products</dt>
            <dd className="text-right font-semibold text-foreground">{stats.totalProducts}</dd>
            <dt className="text-muted-foreground">Customers</dt>
            <dd className="text-right font-semibold text-foreground">{stats.totalCustomers}</dd>
            <dt className="text-muted-foreground">Orders</dt>
            <dd className="text-right font-semibold text-foreground">{stats.totalOrders}</dd>
            <dt className="text-muted-foreground">Revenue</dt>
            <dd className="text-right font-semibold text-foreground">${stats.totalRevenue.toFixed(2)}</dd>
          </dl>
        </section>
      </div>

      <section className="rounded-lg border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        <h2 className="text-sm font-semibold text-foreground">Sign-in security</h2>
        <p className="mt-1.5 max-w-2xl leading-relaxed">
          The admin account has no &ldquo;forgot password&rdquo; email flow, so it can&apos;t be taken
          over through an inbox. The password is changed only from the server with the{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">npm run rotate-admin</code> script.
        </p>
      </section>
    </div>
  );
}
