"use client";

import { useActionState, useState } from "react";
import { CATEGORY_TREE } from "@/lib/categories";
import type { Product } from "@/types/product";
import type { ProductFormState } from "@/actions/product";

const inputClass =
  "px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground";

interface VariantRow {
  color: string;
  size: string;
  sku: string;
  stock: number;
}

export function ProductForm({
  action,
  product,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [category, setCategory] = useState(product?.category ?? CATEGORY_TREE[0].slug);
  const [variants, setVariants] = useState<VariantRow[]>(
    product && product.variants.length > 0
      ? product.variants.map((v) => ({
          color: v.color ?? "",
          size: v.size ?? "",
          sku: v.sku,
          stock: v.stock,
        }))
      : [{ color: "", size: "", sku: "", stock: 0 }],
  );

  const subcategories = CATEGORY_TREE.find((c) => c.slug === category)?.children ?? [];

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addVariant() {
    setVariants((rows) => [...rows, { color: "", size: "", sku: "", stock: 0 }]);
  }

  function removeVariant(index: number) {
    setVariants((rows) => rows.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-[640px]">
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      {state.error && (
        <p className="text-sm text-[#7A3E33] bg-[#FCEFEC] border border-[#EAD6D0] rounded-md px-3.5 py-2.5">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Name</span>
        <input type="text" name="name" required defaultValue={product?.name} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Slug</span>
        <input type="text" name="slug" required defaultValue={product?.slug} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Description</span>
        <textarea name="description" rows={3} defaultValue={product?.description} className={inputClass} />
      </label>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Category</span>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {CATEGORY_TREE.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Subcategory</span>
          <select name="subcategory" defaultValue={product?.subcategory ?? ""} className={inputClass}>
            <option value="">None</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Brand</span>
        <input type="text" name="brand" defaultValue={product?.brand} className={inputClass} />
      </label>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Price</span>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
            className={inputClass}
          />
        </label>
        <label className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Compare-at Price</span>
          <input
            type="number"
            name="compareAtPrice"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Tags (comma separated)</span>
        <input type="text" name="tags" defaultValue={product?.tags?.join(", ")} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Image URLs (one per line)</span>
        <textarea
          name="images"
          rows={3}
          defaultValue={product?.images?.join("\n")}
          placeholder="Leave blank to use the placeholder graphic"
          className={inputClass}
        />
      </label>

      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-foreground" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" name="isNew" defaultChecked={product?.isNew} className="accent-foreground" />
          New Arrival
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Variants</span>
          <button
            type="button"
            onClick={addVariant}
            className="text-xs font-medium text-foreground underline cursor-pointer"
          >
            + Add Variant
          </button>
        </div>

        {variants.map((variant, index) => (
          <div key={index} className="flex gap-2 items-end flex-wrap">
            <label className="flex flex-col gap-1 flex-1 min-w-[90px]">
              <span className="text-[11px] text-muted-foreground">Color</span>
              <input
                type="text"
                value={variant.color}
                onChange={(e) => updateVariant(index, { color: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[70px]">
              <span className="text-[11px] text-muted-foreground">Size</span>
              <input
                type="text"
                value={variant.size}
                onChange={(e) => updateVariant(index, { size: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[110px]">
              <span className="text-[11px] text-muted-foreground">SKU</span>
              <input
                type="text"
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 w-[90px]">
              <span className="text-[11px] text-muted-foreground">Stock</span>
              <input
                type="number"
                min="0"
                value={variant.stock}
                onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={() => removeVariant(index)}
              aria-label="Remove variant"
              className="h-[46px] px-3 text-muted-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "SAVING..." : product ? "SAVE CHANGES" : "CREATE PRODUCT"}
      </button>
    </form>
  );
}
