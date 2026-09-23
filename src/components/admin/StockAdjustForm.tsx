"use client";

import { useActionState } from "react";
import { adjustStockAction, type AdjustStockState } from "@/actions/inventory";

const control =
  "px-2.5 py-2 border border-border rounded-md text-xs text-foreground bg-card focus:outline-none focus:border-foreground";

export function StockAdjustForm({ productId, sku }: { productId: string; sku: string }) {
  const [state, formAction, pending] = useActionState<AdjustStockState, FormData>(
    adjustStockAction,
    {},
  );

  return (
    <details className="group">
      <summary className="text-xs font-medium text-foreground underline cursor-pointer list-none">
        Adjust
      </summary>
      <form action={formAction} className="mt-2 flex flex-col gap-2 min-w-[230px]">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="sku" value={sku} />
        <div className="flex gap-2">
          <select name="mode" aria-label="Adjustment type" defaultValue="add" className={control}>
            <option value="add">Add / remove</option>
            <option value="set">Set to</option>
          </select>
          <input
            type="number"
            name="amount"
            required
            step={1}
            aria-label="Amount"
            placeholder="e.g. 10 or -2"
            className={`${control} w-24`}
          />
        </div>
        <select name="reason" aria-label="Reason" defaultValue="restock" className={control}>
          <option value="restock">Restock</option>
          <option value="stocktake">Stocktake</option>
          <option value="damaged">Damaged / lost</option>
          <option value="return">Customer return</option>
          <option value="correction">Correction</option>
        </select>
        <input
          type="text"
          name="note"
          maxLength={200}
          aria-label="Note"
          placeholder="Note (optional)"
          className={control}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="px-3 py-1.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
          >
            {pending ? "SAVING..." : "SAVE"}
          </button>
          {state.success && (
            <span role="status" className="text-xs text-[#2F6B3F]">
              Saved.
            </span>
          )}
        </div>
        {state.error && (
          <span role="alert" className="text-xs text-[#7A3E33] max-w-[230px]">
            {state.error}
          </span>
        )}
      </form>
    </details>
  );
}
