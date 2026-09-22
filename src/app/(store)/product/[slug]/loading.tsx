import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
      <Skeleton className="h-3 w-56 mb-4" />
      <div className="flex flex-col md:flex-row gap-11">
        <div className="flex gap-3.5">
          <div className="flex md:flex-col gap-2.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="w-16 h-20 shrink-0" />
            ))}
          </div>
          <Skeleton className="w-full md:w-[440px] h-[500px] md:h-[600px]" />
        </div>
        <div className="flex-1 flex flex-col gap-[18px] max-w-[420px] min-w-0">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
