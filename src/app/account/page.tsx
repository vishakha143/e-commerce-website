import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getOrdersByUserId } from "@/services/orderService";
import { getAttentionCounts } from "@/services/adminService";
import { OrderCard } from "@/components/account/OrderCard";
import { WishlistPreview } from "@/components/account/WishlistPreview";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "admin";
  const name = session?.user?.name ?? "there";
  const firstName = name.split(" ")[0];

  await connectDB();
  const [user, orders, attention] = await Promise.all([
    userId ? User.findById(userId).select("createdAt").lean<{ createdAt: Date }>() : null,
    userId ? getOrdersByUserId(userId) : [],
    isAdmin ? getAttentionCounts() : null,
  ]);

  const counted = orders.filter((o) => o.status !== "cancelled");
  const spent = counted.reduce((sum, o) => sum + o.total, 0);
  const recent = orders.slice(0, 3);
  const since = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F3E9DF] via-[#F7EFE8] to-[#FBE7E0] p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/50 blur-2xl"
        />
        <div className="relative flex items-center gap-4">
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-foreground text-2xl font-bold text-background"
          >
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-foreground">Hi, {firstName}</h1>
            <p className="truncate text-sm text-foreground/70">
              {session?.user?.email}
              {since && ` · Member since ${since}`}
            </p>
          </div>
        </div>
      </section>

      {isAdmin && attention && (
        <section className="rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#312E81] to-[#4F46E5] p-5 md:p-6 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck size={18} aria-hidden /> You are signed in as store admin
          </div>
          <p className="mt-1 text-sm text-indigo-200">
            This is your personal shopping account. Store management lives in the admin console.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Orders waiting", value: attention.pendingOrders },
              { label: "Low stock", value: attention.lowStock },
              { label: "Out of stock", value: attention.outOfStock },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-white/10 px-2 py-3">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-[11px] text-indigo-200">{s.label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/admin"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-semibold tracking-wide text-[#0F172A]"
          >
            OPEN ADMIN CONSOLE <ArrowRight size={14} aria-hidden />
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatTile label={isAdmin ? "My orders" : "Orders"} value={counted.length} />
        <StatTile label="Total spent" value={`$${spent.toFixed(2)}`} />
        <div className="col-span-2 md:col-span-1 rounded-lg border border-border bg-card p-4 flex flex-col justify-between gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Free shipping
          </div>
          <div className="text-sm text-foreground">On every order over $150</div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Recent orders</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="text-xs font-semibold text-foreground underline">
              View all
            </Link>
          )}
        </div>
        {recent.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recent.map((o) => (
              <OrderCard
                key={String(o._id)}
                order={{
                  id: String(o._id),
                  itemCount: o.items.reduce((n: number, i: { quantity: number }) => n + i.quantity, 0),
                  total: o.total,
                  status: o.status,
                  createdAt: o.createdAt,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No orders yet.{" "}
            <Link href="/shop" className="font-semibold text-foreground underline">
              Start shopping
            </Link>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-foreground">Saved for later</h2>
        <WishlistPreview />
      </section>
    </div>
  );
}
