"use client";

import { useState, useTransition } from "react";
import { setCouponActiveAction, deleteCouponAction } from "@/actions/coupon";

export function CouponRowActions({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ success: boolean }>) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fn();
        if (!res.success) setError("Could not update.");
      } catch {
        setError("Could not update. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setCouponActiveAction(id, !active))}
          className="px-2.5 py-1 border border-border rounded text-[11px] font-semibold cursor-pointer disabled:opacity-60"
        >
          {active ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this coupon? Past orders keep their discount.")) return;
            run(() => deleteCouponAction(id));
          }}
          className="px-2.5 py-1 border border-[#EAD6D0] text-[#7A3E33] rounded text-[11px] font-semibold cursor-pointer disabled:opacity-60"
        >
          Delete
        </button>
      </div>
      {error && (
        <span role="alert" className="text-[11px] text-[#7A3E33]">
          {error}
        </span>
      )}
    </div>
  );
}
