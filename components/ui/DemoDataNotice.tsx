import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Honesty notice shown wherever sample listings appear: the data has not been
 * verified with vendors and no ratings or reviews have been collected yet.
 */
export function DemoDataNotice({ className }: { className?: string }) {
  return (
    <aside
      aria-label="About this data"
      className={cn(
        "flex items-start gap-3 rounded-md border border-line bg-surface-alt px-4 py-3 text-[0.8125rem] leading-5 text-subtle",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue" strokeWidth={2} />
      <p>
        <span className="font-medium text-ink">Demonstration data.</span>{" "}
        Listings are sample entries that have not yet been verified with
        vendors. Ratings and reviews appear only once real reviews are
        collected.
      </p>
    </aside>
  );
}
