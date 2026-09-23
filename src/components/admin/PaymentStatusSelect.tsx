"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePaymentStatusAction } from "@/actions/order";
import { allowedNextPaymentStatuses } from "@/lib/orderStatus";
import type { OrderStatus, PaymentStatus } from "@/types/order";

export function PaymentStatusSelect({
  orderId,
  payment,
  orderStatus,
}: {
  orderId: string;
  payment: PaymentStatus;
  orderStatus: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const options = [payment, ...allowedNextPaymentStatuses(payment, orderStatus)];

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={payment}
        disabled={pending || options.length === 1}
        aria-label="Payment status"
        onChange={(e) => {
          const next = e.target.value as PaymentStatus;
          setMessage(null);
          startTransition(async () => {
            try {
              const result = await updatePaymentStatusAction(orderId, next);
              setMessage(
                result.success
                  ? { ok: true, text: `Payment marked ${next}.` }
                  : { ok: false, text: result.error ?? "Could not update payment." },
              );
              router.refresh();
            } catch {
              setMessage({ ok: false, text: "Could not update payment. Please try again." });
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
      {message && (
        <span role="status" className={message.ok ? "text-xs text-[#2F6B3F]" : "text-xs text-[#7A3E33]"}>
          {message.text}
        </span>
      )}
    </div>
  );
}
