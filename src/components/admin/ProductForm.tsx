"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { CATEGORY_TREE } from "@/lib/categories";
import type { Product, ProductImage } from "@/types/product";
import type { ProductFormState } from "@/actions/product";

const inputClass =
  "px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground";

interface VariantRow {
  color: string;
  size: string;
  sku: string;
  stock: number;
}

interface ImageSlot {
  tempId: string;
  url: string;
  publicId: string;
  alt: string;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
}

function toImageSlots(images: ProductImage[] = []): ImageSlot[] {
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => ({
      tempId: img.publicId,
      url: img.url,
      publicId: img.publicId,
      alt: img.alt ?? "",
      status: "done" as const,
    }));
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

  const [images, setImages] = useState<ImageSlot[]>(() => toImageSlots(product?.images));
  const initialPublicIds = useRef(new Set((product?.images ?? []).map((i) => i.publicId)));
  const isUploading = images.some((img) => img.status === "uploading");

  const imagesJson = JSON.stringify(
    images
      .filter((img) => img.status === "done")
      .map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        alt: img.alt,
        sortOrder: index,
        isPrimary: index === 0,
      })),
  );

  async function uploadOne(file: File, tempId: string) {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImages((prev) =>
        prev.map((img) =>
          img.tempId === tempId
            ? { ...img, status: "done", url: data.url, publicId: data.publicId }
            : img,
        ),
      );
    } catch (err) {
      setImages((prev) =>
        prev.map((img) =>
          img.tempId === tempId
            ? {
                ...img,
                status: "error",
                errorMessage: err instanceof Error ? err.message : "Upload failed",
              }
            : img,
        ),
      );
    }
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const slots: ImageSlot[] = files.map((file) => ({
      tempId: `${file.name}-${Date.now()}-${Math.random()}`,
      url: "",
      publicId: "",
      alt: "",
      status: "uploading",
    }));
    setImages((prev) => [...prev, ...slots]);
    files.forEach((file, i) => uploadOne(file, slots[i].tempId));
  }

  function removeImage(tempId: string) {
    const target = images.find((img) => img.tempId === tempId);
    setImages((prev) => prev.filter((img) => img.tempId !== tempId));

    // Only an image uploaded during THIS editing session is safe to delete
    // immediately — one the product already had stays referenced until
    // Save, so abandoning the edit doesn't destroy it. The server diffs and
    // cleans up removed pre-existing images when an update actually saves.
    if (target?.publicId && target.status === "done" && !initialPublicIds.current.has(target.publicId)) {
      fetch("/api/media/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: target.publicId }),
      }).catch(() => {});
    }
  }

  function moveImage(tempId: string, direction: -1 | 1) {
    setImages((prev) => {
      const index = prev.findIndex((img) => img.tempId === tempId);
      const swapWith = index + direction;
      if (index === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }

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
      <input type="hidden" name="imagesJson" value={imagesJson} />

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

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground">Images</span>
        <div className="flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div
              key={img.tempId}
              className="relative w-24 h-28 rounded-md overflow-hidden border border-border bg-background"
            >
              {img.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center text-center px-1 text-[10px] text-muted-foreground">
                  Uploading…
                </div>
              )}
              {img.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center text-center px-1 text-[10px] text-[#7A3E33] bg-[#FCEFEC]">
                  {img.errorMessage ?? "Failed"}
                </div>
              )}
              {img.status === "done" && (
                <Image
                  src={img.url}
                  alt={img.alt || "Product image"}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
              {index === 0 && img.status === "done" && (
                <span className="absolute top-1 left-1 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded">
                  PRIMARY
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.tempId)}
                aria-label="Remove image"
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 text-foreground text-xs cursor-pointer"
              >
                ✕
              </button>
              {img.status === "done" && images.length > 1 && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(img.tempId, -1)}
                      aria-label="Move earlier"
                      className="w-5 h-5 rounded bg-background/90 text-[10px] cursor-pointer"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(img.tempId, 1)}
                      aria-label="Move later"
                      className="w-5 h-5 rounded bg-background/90 text-[10px] cursor-pointer"
                    >
                      →
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          <label className="w-24 h-28 rounded-md border border-dashed border-border flex items-center justify-center text-center px-1 text-[11px] text-muted-foreground cursor-pointer">
            + Add image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <span className="text-[11px] text-muted-foreground">
          JPEG, PNG, or WebP, up to 5MB each. First image is the primary photo — use the arrows to
          reorder.
        </span>
      </div>

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
        disabled={pending || isUploading}
        className="w-full py-3.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer disabled:opacity-60"
      >
        {pending ? "SAVING..." : isUploading ? "UPLOADING IMAGES…" : product ? "SAVE CHANGES" : "CREATE PRODUCT"}
      </button>
    </form>
  );
}
