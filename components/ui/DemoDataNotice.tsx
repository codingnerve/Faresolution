import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Honesty notice shown wherever sample listings appear: the data has not been
 * verified with vendors and no ratings or reviews have been collected yet.
 * `tone="dark"` is for navy surfaces such as the footer.
 */
export function DemoDataNotice({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <aside
      aria-label="About this data"
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-[0.8125rem] leading-5",
        dark
          ? "border-white/12 bg-white/5 text-white/75"
          : "border-line bg-surface-alt text-subtle",
        className,
      )}
    >
      <Info
        aria-hidden="true"
        className={cn("mt-0.5 size-4 shrink-0", dark ? "text-blue-light" : "text-blue")}
        strokeWidth={2}
      />
      <p>
        <span className={cn("font-medium", dark ? "text-white" : "text-ink")}>
          Demonstration data.
        </span>{" "}
        Listings are sample entries that have not yet been verified with
        vendors. Ratings and reviews appear only once real reviews are
        collected.
      </p>
    </aside>
  );
}
