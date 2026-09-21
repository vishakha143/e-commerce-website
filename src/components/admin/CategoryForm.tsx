"use client";

import { useActionState } from "react";
import { createCategoryAction, type CategoryFormState } from "@/actions/category";

const inputClass =
  "px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground";

const initialState: CategoryFormState = {};

export function CategoryForm({
  parentOptions,
}: {
  parentOptions: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 p-5 bg-card border border-border rounded-lg max-w-sm">
      <h2 className="text-sm font-semibold text-foreground">Add Category</h2>

      {state.error && (
        <p className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Name</span>
        <input type="text" name="name" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Slug</span>
        <input type="text" name="slug" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Parent Category (optional)</span>
        <select name="parent" defaultValue="" className={inputClass}>
          <option value="">None (top-level)</option>
          {parentOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="py-3 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "ADDING..." : "ADD CATEGORY"}
      </button>
    </form>
  );
}
