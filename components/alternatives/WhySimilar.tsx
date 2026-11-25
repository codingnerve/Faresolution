import { cn } from "@/lib/utils";

/** How many reasons the one-line summary shows (the engine returns them strongest first). */
export const WHY_SIMILAR_LIMIT = 3;

/**
 * The "Why it's similar" line under an alternative: the engine's plain-language
 * reasons, strongest first. Renders nothing when there are none.
 */
export function WhySimilar({ reasons, className }: { reasons: readonly string[]; className?: string }) {
  const shown = reasons.slice(0, WHY_SIMILAR_LIMIT);
  if (shown.length === 0) return null;
  return (
    <p className={cn("text-[0.8125rem] leading-5 text-subtle", className)}>
      <span className="font-medium text-navy">{"Why it's similar:"}</span> {shown.join(" · ")}
    </p>
  );
}
