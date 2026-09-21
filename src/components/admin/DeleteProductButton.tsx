"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/actions/product";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        startTransition(async () => {
          await deleteProductAction(id);
          router.push("/admin/products");
        });
      }}
      className="px-4 py-2.5 border border-[#EAD6D0] text-[#7A3E33] rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
    >
      {pending ? "DELETING..." : "DELETE PRODUCT"}
    </button>
  );
}
