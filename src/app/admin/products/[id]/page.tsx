import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { updateProductAction } from "@/actions/product";
import { getProductByIdAdmin } from "@/services/productService";

export const metadata: Metadata = {
  title: "Edit Product | Admin | Fashion",
};

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const product = await getProductByIdAdmin(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
        <DeleteProductButton id={product.id} />
      </div>
      <ProductForm action={updateProductAction.bind(null, product.id)} product={product} />
    </div>
  );
}
