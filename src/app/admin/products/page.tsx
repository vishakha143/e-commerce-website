import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Pagination } from "@/components/ui/Pagination";
import { listProductsAdmin, type AdminVisibility } from "@/services/productService";
import { getAllCategoriesFlat } from "@/services/categoryService";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Admin · Products",
  robots: { index: false, follow: false },
};

const VISIBILITY: { key: AdminVisibility; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "unpublished", label: "Drafts" },
];

export default async function AdminProductsPage(props: PageProps<"/admin/products">) {
  const sp = await props.searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = get("q") ?? "";
  const category = get("category") ?? "";
  const visibility = (["published", "unpublished"].includes(get("visibility") ?? "")
    ? get("visibility")
    : "all") as AdminVisibility;
  const page = Number(get("page")) || 1;

  const [result, categories] = await Promise.all([
    listProductsAdmin({ q, category, visibility, page }),
    getAllCategoriesFlat(),
  ]);

  const columns: Column<Product>[] = [
    {
      header: "",
      render: (p) => {
        const primary = p.images.find((img) => img.isPrimary) ?? p.images[0];
        return (
          <div className="relative w-10 h-12 rounded overflow-hidden bg-[repeating-linear-gradient(45deg,#EDEBE6,#EDEBE6_6px,#E3E0DA_6px,#E3E0DA_12px)]">
            {primary && <Image src={primary.url} alt="" fill sizes="40px" className="object-cover" />}
          </div>
        );
      },
    },
    { header: "Name", render: (p) => p.name },
    {
      header: "Status",
      render: (p) =>
        p.published === false ? (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FBF3DC] text-[#7A5B12]">Draft</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F1EA] text-[#2F6B3F]">Published</span>
        ),
    },
    { header: "Category", render: (p) => `${p.category}${p.subcategory ? ` / ${p.subcategory}` : ""}` },
    { header: "Price", render: (p) => `$${p.price.toFixed(2)}` },
    { header: "Stock", render: (p) => p.variants.reduce((sum, v) => sum + v.stock, 0) },
    { header: "", render: (p) => <PublishToggle id={p.id} published={p.published !== false} /> },
    {
      header: "",
      render: (p) => (
        <Link href={`/admin/products/${p.id}`} className="text-xs font-medium text-foreground underline">
          Edit →
        </Link>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide"
        >
          + NEW PRODUCT
        </Link>
      </div>

      <form action="/admin/products" className="flex flex-wrap gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder="Search name, brand or SKU"
          aria-label="Search products"
          className="flex-1 min-w-[200px] px-3 py-2 border border-border rounded-md text-sm bg-card focus:outline-none focus:border-foreground"
        />
        <select
          name="category"
          defaultValue={category}
          aria-label="Category"
          className="px-3 py-2 border border-border rounded-md text-sm bg-card"
        >
          <option value="">All categories</option>
          {categories
            .filter((c) => !c.parentName)
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
        </select>
        <select
          name="visibility"
          defaultValue={visibility}
          aria-label="Visibility"
          className="px-3 py-2 border border-border rounded-md text-sm bg-card"
        >
          {VISIBILITY.map((v) => (
            <option key={v.key} value={v.key}>
              {v.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-foreground text-background rounded-md text-xs font-semibold tracking-wide cursor-pointer"
        >
          FILTER
        </button>
      </form>

      <DataTable columns={columns} rows={result.products} keyFor={(p) => p.id} emptyMessage="No products match." />

      <Pagination
        basePath="/admin/products"
        searchParams={{
          q: q || undefined,
          category: category || undefined,
          visibility: visibility === "all" ? undefined : visibility,
        }}
        page={result.page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
