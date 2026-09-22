import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,#EDEBE6_25%,#E3E0DA_37%,#EDEBE6_63%)] bg-[length:600px_100%] [animation:shimmer_1.4s_infinite]",
        className,
      )}
    />
  );
}
