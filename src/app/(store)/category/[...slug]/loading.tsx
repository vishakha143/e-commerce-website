import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function CategoryLoading() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col gap-2 mb-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-8">
        <aside className="hidden md:flex w-[220px] shrink-0 flex-col gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </aside>
        <div className="flex-1 min-w-0">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
