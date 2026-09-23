"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/actions/product";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this product? This cannot be undone.")) return;
          setError(null);
          startTransition(async () => {
            try {
              await deleteProductAction(id);
              router.push("/admin/products");
            } catch {
              setError("Could not delete the product. Please try again.");
            }
          });
        }}
        className="px-4 py-2.5 border border-[#EAD6D0] text-[#7A3E33] rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "DELETING..." : "DELETE PRODUCT"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-[#7A3E33]">
          {error}
        </span>
      )}
    </div>
  );
}
