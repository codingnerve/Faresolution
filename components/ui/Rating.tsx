import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingProps = {
  /** Average rating out of 5, or `null` when there are no verified reviews. */
  value: number | null;
  count: number;
  size?: "sm" | "md";
  className?: string;
};

const countFormat = new Intl.NumberFormat("en-US");

/**
 * Star rating that never fabricates: stars appear only for a positive value
 * backed by at least one review. Anything else (null, NaN, 0, or a value
 * with no reviews) reads "No reviews yet" instead of empty stars or 0.0.
 */
export function Rating({ value, count, size = "sm", className }: RatingProps) {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;

  if (value === null || !Number.isFinite(value) || value <= 0 || safeCount === 0) {
    return (
      <span className={cn("type-meta inline-flex items-center", className)}>
        No reviews yet
      </span>
    );
  }

  const rating = Math.min(5, value);
  const label = `Rated ${rating.toFixed(1)} out of 5 from ${countFormat.format(safeCount)} ${
    safeCount === 1 ? "review" : "reviews"
  }`;
  const iconSize = size === "md" ? "size-4" : "size-3.5";

  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.min(1, Math.max(0, rating - index));
          return (
            <span key={index} className={cn("relative inline-flex", iconSize)}>
              <Star className={cn("text-line-strong", iconSize)} fill="currentColor" strokeWidth={0} />
              {fill > 0 && (
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star
                    className={cn("max-w-none text-navy", iconSize)}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      <span
        className={cn(
          "font-medium text-ink tabular-nums",
          size === "md" ? "text-[0.9375rem]" : "text-[0.8125rem]",
        )}
        aria-hidden="true"
      >
        {rating.toFixed(1)}
      </span>
      <span className="type-meta tabular-nums" aria-hidden="true">
        ({countFormat.format(safeCount)})
      </span>
    </span>
  );
}
