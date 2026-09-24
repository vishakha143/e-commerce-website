"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { getReviewEligibilityAction, submitReviewAction, type ReviewFormState } from "@/actions/review";

type Gate =
  | { state: "loading" }
  | { state: "logged-out" }
  | { state: "not-purchased" }
  | { state: "reviewed" }
  | { state: "can-review" };

const initialForm: ReviewFormState = {};
const inputClass =
  "px-3 py-2.5 border border-border rounded-md text-sm text-foreground bg-card focus:outline-none focus:border-foreground";

/**
 * Whether the viewer may review depends on who they are, so it's resolved on
 * the client. That keeps the product page itself static/cached.
 */
export function ReviewFormGate({ productId }: { productId: string }) {
  const [gate, setGate] = useState<Gate>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    getReviewEligibilityAction(productId)
      .then((e) => {
        if (cancelled) return;
        if (!e.loggedIn) setGate({ state: "logged-out" });
        else if (e.hasReviewed) setGate({ state: "reviewed" });
        else if (e.canReview) setGate({ state: "can-review" });
        else setGate({ state: "not-purchased" });
      })
      .catch(() => {
        if (!cancelled) setGate({ state: "not-purchased" });
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (gate.state === "loading") return null;

  if (gate.state === "logged-out") {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="underline font-medium text-foreground">
          Log in
        </Link>{" "}
        to review products you have bought.
      </p>
    );
  }
  if (gate.state === "reviewed") {
    return <p className="text-sm text-muted-foreground">Thanks, you have already reviewed this product.</p>;
  }
  if (gate.state === "not-purchased") {
    return (
      <p className="text-sm text-muted-foreground">Reviews are open to customers whose order has been delivered.</p>
    );
  }
  return <ReviewForm productId={productId} onDone={() => setGate({ state: "reviewed" })} />;
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [state, formAction, pending] = useActionState(submitReviewAction.bind(null, productId), initialForm);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (state.success) onDone();
  }, [state.success, onDone]);

  const shown = hover || rating;

  return (
    <form action={formAction} className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-card">
      <h3 className="text-sm font-semibold text-foreground">Write a review</h3>

      {state.error && (
        <p role="alert" className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3 py-2">
          {state.error}
        </p>
      )}

      <input type="hidden" name="rating" value={rating} />
      <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className={`text-2xl leading-none cursor-pointer ${n <= shown ? "text-[#C9922E]" : "text-[#D8D5CF]"}`}
          >
            ★
          </button>
        ))}
      </div>

      <input type="text" name="title" maxLength={100} placeholder="Headline (optional)" className={inputClass} />
      <textarea
        name="comment"
        required
        minLength={10}
        maxLength={2000}
        rows={4}
        placeholder="How was the fit, quality and feel?"
        className={inputClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "SUBMITTING..." : "SUBMIT REVIEW"}
      </button>
    </form>
  );
}
