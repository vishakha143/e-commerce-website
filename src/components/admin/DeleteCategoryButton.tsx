"use client";

import { useTransition } from "react";
import { deleteCategoryAction } from "@/actions/category";

export function DeleteCategoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this category?")) return;
        startTransition(() => deleteCategoryAction(id));
      }}
      className="text-xs font-medium text-[#7A3E33] underline cursor-pointer disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
