import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";
import { getAllCategoriesFlat } from "@/services/categoryService";

export const metadata: Metadata = {
  title: "Admin · Categories",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesFlat();
  const topLevel = categories.filter((c) => !c.parentName);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Categories</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-2">
          {categories.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg py-16 text-center text-sm text-muted-foreground">
              No categories yet.
            </div>
          ) : (
            categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-card"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {c.parentName ? `${c.parentName} / ${c.name}` : c.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{c.slug}</div>
                </div>
                <DeleteCategoryButton id={c.id} />
              </div>
            ))
          )}
        </div>

        <CategoryForm parentOptions={topLevel.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
