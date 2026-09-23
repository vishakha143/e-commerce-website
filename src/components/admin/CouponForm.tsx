"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCouponAction, type CouponFormState } from "@/actions/coupon";

const inputClass =
  "px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground";

const initialState: CouponFormState = {};

export function CouponForm() {
  const [state, formAction, pending] = useActionState(createCouponAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg max-w-sm"
    >
      <h2 className="text-sm font-semibold text-foreground">Add Coupon</h2>

      {state.error && (
        <p role="alert" className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-[#2F6B3F] bg-[#E8F1EA] rounded-md px-3.5 py-2.5">
          Coupon created.
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Code</span>
        <input type="text" name="code" required maxLength={30} placeholder="WELCOME10" className={`${inputClass} uppercase`} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Type</span>
          <select name="type" defaultValue="percent" className={inputClass}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Value</span>
          <input type="number" name="value" required min="0.01" step="0.01" className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Minimum subtotal (optional)</span>
        <input type="number" name="minSubtotal" min="0" step="0.01" placeholder="0" className={inputClass} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Max uses</span>
          <input type="number" name="maxUses" min="1" step="1" placeholder="Unlimited" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Expires</span>
          <input type="date" name="expiresAt" className={inputClass} />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">Each customer can use a code once.</p>

      <button
        type="submit"
        disabled={pending}
        className="py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "ADDING..." : "ADD COUPON"}
      </button>
    </form>
  );
}
