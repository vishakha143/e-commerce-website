import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

export default function SearchLoading() {
  return (
    <div className="px-4 md:px-8 py-10 max-w-[1600px] mx-auto w-full">
      <Skeleton className="h-7 w-64 mb-2" />
      <Skeleton className="h-4 w-40 mb-6" />
      <ProductGridSkeleton />
    </div>
  );
}
