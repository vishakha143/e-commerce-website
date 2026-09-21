import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { getAllReviewsAdmin } from "@/services/reviewService";

export const metadata: Metadata = {
  title: "Reviews | Admin | Fashion",
};

interface ReviewRow {
  id: string;
  product: string;
  customer: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

export default async function AdminReviewsPage() {
  const docs = await getAllReviewsAdmin();

  const rows: ReviewRow[] = docs.map((doc) => {
    const user = doc.user as unknown as { name?: string } | null;
    const product = doc.product as unknown as { name?: string } | null;
    return {
      id: String(doc._id),
      product: product?.name ?? "Unknown product",
      customer: user?.name ?? "Unknown",
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
    };
  });

  const columns: Column<ReviewRow>[] = [
    { header: "Product", render: (r) => r.product },
    { header: "Customer", render: (r) => r.customer },
    { header: "Rating", render: (r) => `★ ${r.rating}` },
    { header: "Comment", render: (r) => <span className="line-clamp-1">{r.comment}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
      <DataTable
        columns={columns}
        rows={rows}
        keyFor={(r) => r.id}
        emptyMessage="No reviews yet — customer review submission is coming in a later phase."
      />
    </div>
  );
}
