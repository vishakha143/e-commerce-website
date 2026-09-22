import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { getAllProductsAdmin } from "@/services/productService";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Admin · Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  const columns: Column<Product>[] = [
    {
      header: "",
      render: (p) => {
        const primary = p.images.find((img) => img.isPrimary) ?? p.images[0];
        return (
          <div className="relative w-10 h-12 rounded overflow-hidden bg-[repeating-linear-gradient(45deg,#EDEBE6,#EDEBE6_6px,#E3E0DA_6px,#E3E0DA_12px)]">
            {primary && (
              <Image src={primary.url} alt="" fill sizes="40px" className="object-cover" />
            )}
          </div>
        );
      },
    },
    { header: "Name", render: (p) => p.name },
    { header: "Category", render: (p) => `${p.category}${p.subcategory ? ` / ${p.subcategory}` : ""}` },
    { header: "Price", render: (p) => `$${p.price.toFixed(2)}` },
    {
      header: "Stock",
      render: (p) => p.variants.reduce((sum, v) => sum + v.stock, 0),
    },
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

      <DataTable columns={columns} rows={products} keyFor={(p) => p.id} emptyMessage="No products yet." />
    </div>
  );
}
