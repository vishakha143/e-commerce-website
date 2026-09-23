"use client";

import { useState, useTransition } from "react";
import { setProductPublishedAction } from "@/actions/product";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const res = await setProductPublishedAction(id, !published);
              if (!res.success) setError(res.error ?? "Could not update.");
            } catch {
              setError("Could not update. Please try again.");
            }
          });
        }}
        className="px-2.5 py-1 border border-border rounded text-[11px] font-semibold cursor-pointer disabled:opacity-60"
      >
        {pending ? "..." : published ? "Unpublish" : "Publish"}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-[#7A3E33]">
          {error}
        </span>
      )}
    </div>
  );
}
