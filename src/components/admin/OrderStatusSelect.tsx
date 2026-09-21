"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/actions/order";
import type { OrderStatus } from "@/types/order";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(async () => {
          await updateOrderStatusAction(orderId, next);
          router.refresh();
        });
      }}
      className="px-3 py-2 border border-border rounded-md text-sm text-foreground capitalize cursor-pointer disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
