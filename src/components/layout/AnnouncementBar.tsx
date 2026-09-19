import { ANNOUNCEMENT_TEXT } from "@/lib/constants";

export function AnnouncementBar() {
  return (
    <div className="bg-foreground text-background text-center py-2 text-[11px] font-medium tracking-wide">
      {ANNOUNCEMENT_TEXT}
    </div>
  );
}
