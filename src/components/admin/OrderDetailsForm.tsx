"use client";

import { useActionState } from "react";
import { updateOrderDetailsAction, type OrderDetailsState } from "@/actions/order";

const inputClass =
  "px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground";

export function OrderDetailsForm({
  orderId,
  trackingReference,
  adminNotes,
}: {
  orderId: string;
  trackingReference: string;
  adminNotes: string;
}) {
  const [state, formAction, pending] = useActionState<OrderDetailsState, FormData>(
    updateOrderDetailsAction.bind(null, orderId),
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg">
      <h2 className="text-sm font-semibold text-foreground">Fulfilment</h2>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">
          Tracking reference (shown to the customer)
        </span>
        <input
          type="text"
          name="trackingReference"
          maxLength={100}
          defaultValue={trackingReference}
          placeholder="Courier name + tracking number"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Internal notes (admins only)</span>
        <textarea
          name="adminNotes"
          rows={3}
          maxLength={2000}
          defaultValue={adminNotes}
          className={inputClass}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
        >
          {pending ? "SAVING..." : "SAVE"}
        </button>
        {state.success && (
          <span role="status" className="text-xs text-[#2F6B3F]">
            Saved.
          </span>
        )}
        {state.error && (
          <span role="alert" className="text-xs text-[#7A3E33]">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
