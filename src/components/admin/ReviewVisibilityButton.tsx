"use client";

import { useState, useTransition } from "react";
import { setReviewStatusAction } from "@/actions/review";

export function ReviewVisibilityButton({ id, hidden }: { id: string; hidden: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1 items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await setReviewStatusAction(id, hidden ? "published" : "hidden");
              if (!res.success) setError("Could not update.");
            } catch {
              setError("Could not update. Please try again.");
            }
          });
        }}
        className="px-2.5 py-1 border border-border rounded text-[11px] font-semibold cursor-pointer disabled:opacity-60"
      >
        {pending ? "..." : hidden ? "Show" : "Hide"}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-[#7A3E33]">
          {error}
        </span>
      )}
    </div>
  );
}
