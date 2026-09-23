"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/order";
import { allowedNextStatuses } from "@/lib/orderStatus";
import type { OrderStatus } from "@/types/order";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const options = [status, ...allowedNextStatuses(status)];

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={status}
        disabled={pending || options.length === 1}
        aria-label="Order status"
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          setMessage(null);
          startTransition(async () => {
            try {
              const result = await updateOrderStatusAction(orderId, next);
              if (result.success) {
                setMessage({
                  ok: true,
                  text: next === "cancelled" ? "Order cancelled, stock restored." : `Marked ${next}.`,
                });
              } else {
                setMessage({ ok: false, text: result.error ?? "Could not update the order." });
              }
              router.refresh();
            } catch {
              setMessage({ ok: false, text: "Could not update the order. Please try again." });
            }
          });
        }}
        className="px-3 py-2 border border-border rounded-md text-sm text-foreground capitalize cursor-pointer disabled:opacity-60"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {options.length === 1 && (
        <span className="text-xs text-muted-foreground">Final status — no further changes.</span>
      )}
      {message && (
        <span
          role="status"
          className={message.ok ? "text-xs text-[#2F6B3F]" : "text-xs text-[#7A3E33]"}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}
