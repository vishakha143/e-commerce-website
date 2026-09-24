import { getPublishedReviews, getRatingSummary } from "@/services/reviewService";
import { ReviewFormGate } from "@/components/reviews/ReviewFormGate";

export function Stars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={className} aria-label={`${value} out of 5 stars`} role="img">
      {"★".repeat(full)}
      <span className="text-[#D8D5CF]">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export async function ReviewsSection({ productId }: { productId: string }) {
  const [summary, { reviews, total }] = await Promise.all([
    getRatingSummary(productId),
    getPublishedReviews(productId, 1),
  ]);

  return (
    <section id="reviews" className="border-t border-border pt-10 mt-12 flex flex-col gap-8">
      <h2 className="text-xl font-bold text-foreground">Customer reviews</h2>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-[280px] shrink-0 flex flex-col gap-4">
          {summary.count > 0 ? (
            <>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-foreground">{summary.average.toFixed(1)}</span>
                <div className="pb-1">
                  <Stars value={summary.average} className="text-[#C9922E] text-base" />
                  <div className="text-xs text-muted-foreground">
                    {summary.count} review{summary.count === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = summary.distribution[star - 1];
                  const pct = summary.count ? (n / summary.count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-6">{star}★</span>
                      <div className="h-1.5 flex-1 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-[#C9922E]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right">{n}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share how it fits.</p>
          )}
          <ReviewFormGate productId={productId} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col divide-y divide-border">
          {reviews.map((r) => (
            <article key={r.id} className="py-5 first:pt-0 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} className="text-[#C9922E] text-sm" />
                {r.title && <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{r.comment}</p>
              <div className="text-xs text-muted-foreground">
                {r.author}
                {r.verifiedPurchase && <span className="text-[#2F6B3F]"> · Verified purchase</span>} ·{" "}
                {new Date(r.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </article>
          ))}
          {total > reviews.length && (
            <p className="pt-4 text-xs text-muted-foreground">Showing the {reviews.length} most recent reviews.</p>
          )}
        </div>
      </div>
    </section>
  );
}
