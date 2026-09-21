import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/actions/product";

export const metadata: Metadata = {
  title: "New Product | Admin | Fashion",
};

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-foreground">New Product</h1>
      <ProductForm action={createProductAction} />
    </div>
  );
}
