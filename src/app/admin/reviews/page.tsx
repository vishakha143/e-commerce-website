import Link from "next/link";
import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ReviewVisibilityButton } from "@/components/admin/ReviewVisibilityButton";
import { getAllReviewsAdmin, type AdminReviewFilter } from "@/services/reviewService";

export const metadata: Metadata = {
  title: "Admin · Reviews",
  robots: { index: false, follow: false },
};

interface ReviewRow {
  id: string;
  product: string;
  productSlug?: string;
  customer: string;
  rating: number;
  title?: string;
  comment: string;
  hidden: boolean;
  createdAt: string | Date;
}

const TABS: { key: AdminReviewFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "hidden", label: "Hidden" },
];

export default async function AdminReviewsPage(props: PageProps<"/admin/reviews">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
  const filter: AdminReviewFilter = raw === "published" || raw === "hidden" ? raw : "all";

  const docs = await getAllReviewsAdmin(filter);

  const rows: ReviewRow[] = docs.map((doc) => {
    const user = doc.user as unknown as { name?: string; email?: string } | null;
    const product = doc.product as unknown as { name?: string; slug?: string } | null;
    return {
      id: String(doc._id),
      product: product?.name ?? "Deleted product",
      productSlug: product?.slug,
      customer: user?.name ?? "Unknown",
      rating: doc.rating,
      title: doc.title || undefined,
      comment: doc.comment,
      hidden: doc.status === "hidden",
      createdAt: doc.createdAt,
    };
  });

  const columns: Column<ReviewRow>[] = [
    {
      header: "Product",
      render: (r) =>
        r.productSlug ? (
          <Link href={`/product/${r.productSlug}#reviews`} className="underline">
            {r.product}
          </Link>
        ) : (
          r.product
        ),
    },
    { header: "Customer", render: (r) => r.customer },
    { header: "Rating", render: (r) => `★ ${r.rating}` },
    {
      header: "Review",
      render: (r) => (
        <div className="max-w-[360px]">
          {r.title && <div className="font-semibold">{r.title}</div>}
          <div className="line-clamp-3 text-muted-foreground">{r.comment}</div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (r) =>
        r.hidden ? (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FCEFEC] text-[#7A3E33]">Hidden</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F1EA] text-[#2F6B3F]">Published</span>
        ),
    },
    {
      header: "Date",
      render: (r) =>
        new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    { header: "", render: (r) => <ReviewVisibilityButton id={r.id} hidden={r.hidden} />, className: "text-right" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">Reviews</h1>

      <nav aria-label="Review filter" className="flex gap-1.5">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/reviews" : `/admin/reviews?filter=${t.key}`}
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

      <DataTable
        columns={columns}
        rows={rows}
        keyFor={(r) => r.id}
        emptyMessage="No reviews here yet. Customers can review a product once their order is delivered."
      />
    </div>
  );
}
