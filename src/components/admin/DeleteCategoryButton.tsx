"use client";

import { useState, useTransition } from "react";
import { deleteCategoryAction } from "@/actions/category";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this category?")) return;
          setError(null);
          startTransition(async () => {
            try {
              const result = await deleteCategoryAction(id);
              if (!result.success) setError(result.error ?? "Could not delete the category.");
            } catch {
              setError("Could not delete the category. Please try again.");
            }
          });
        }}
        className="text-xs font-medium text-[#7A3E33] underline cursor-pointer disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-[#7A3E33] max-w-[220px]">
          {error}
        </span>
      )}
    </span>
  );
}
