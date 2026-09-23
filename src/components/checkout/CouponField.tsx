"use client";

import { useState, useTransition } from "react";
import { previewCouponAction } from "@/actions/coupon";
import { useCartStore } from "@/store/cartStore";

export interface AppliedCoupon {
  code: string;
  discount: number;
}

export function CouponField({
  applied,
  onChange,
}: {
  applied: AppliedCoupon | null;
  onChange: (coupon: AppliedCoupon | null) => void;
}) {
  const items = useCartStore((s) => s.items);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-md bg-[#E8F1EA] px-3 py-2 text-xs text-[#2F6B3F]">
        <span>
          <span className="font-semibold">{applied.code}</span> applied
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="font-semibold underline cursor-pointer"
        >
          Remove
        </button>
      </div>
    );
  }

  function apply() {
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await previewCouponAction(code, items);
        if (res.ok && res.code && res.discount !== undefined) {
          onChange({ code: res.code, discount: res.discount });
          setCode("");
        } else {
          setError(res.error ?? "Could not apply that code.");
        }
      } catch {
        setError("Could not apply that code. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            // Enter here must apply the code, not submit the whole order form.
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          maxLength={30}
          placeholder="Promo code"
          aria-label="Promo code"
          className="w-full min-w-0 px-2.5 py-2 border border-border rounded-md text-xs uppercase"
        />
        <button
          type="button"
          onClick={apply}
          disabled={pending || !code.trim()}
          className="shrink-0 px-3 py-2 border border-border rounded-md text-xs font-semibold cursor-pointer disabled:opacity-60"
        >
          {pending ? "..." : "APPLY"}
        </button>
      </div>
      {error && (
        <span role="alert" className="text-xs text-[#7A3E33]">
          {error}
        </span>
      )}
    </div>
  );
}
