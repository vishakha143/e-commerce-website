import { cn } from "@/lib/utils";
import { BRAND_NAME } from "@/lib/constants";

/**
 * Monogram + wordmark. The mark is a thin ring with a serif "F" and a small
 * terracotta dot; everything else follows `currentColor`, so the same component
 * works on the light header and the dark footer. Change BRAND_NAME in
 * src/lib/constants.ts to rename the store everywhere.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("h-8 w-8 shrink-0", className)}
      fill="none"
    >
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fontSize="23"
        fontWeight="700"
        fill="currentColor"
        style={{ fontFamily: "var(--font-display), Georgia, 'Times New Roman', serif" }}
      >
        {BRAND_NAME.charAt(0).toUpperCase()}
      </text>
      <circle cx="31.5" cy="9" r="2.6" fill="#B14328" />
    </svg>
  );
}

export function Logo({
  className,
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!markOnly && (
        <span className="font-display text-xl md:text-[22px] font-bold leading-none tracking-[0.18em]">
          {BRAND_NAME.toUpperCase()}
        </span>
      )}
      {markOnly && <span className="sr-only">{BRAND_NAME}</span>}
    </span>
  );
}
