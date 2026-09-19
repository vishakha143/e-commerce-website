import { cn } from "@/lib/utils";

export function PlaceholderImage({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[repeating-linear-gradient(45deg,#EDEBE6,#EDEBE6_10px,#E3E0DA_10px,#E3E0DA_20px)]",
        className,
      )}
    >
      {label && (
        <span className="font-mono text-[11px] leading-relaxed text-[#8A8680] text-center px-4">
          {label}
        </span>
      )}
    </div>
  );
}
