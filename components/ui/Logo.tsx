import { useId } from "react";
import { cn, SITE_NAME } from "@/lib/utils";

type LogoProps = {
  /** `color` uses the brand palette; `mono` renders in `currentColor` only. */
  tone?: "color" | "mono";
  /** Hide the wordmark to show the mark alone (the name stays for screen readers). */
  markOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markSizes = { sm: 24, md: 28, lg: 40 } as const;
const wordSizes = {
  sm: "text-[0.9375rem]",
  md: "text-[1.0625rem]",
  lg: "text-[1.5rem]",
} as const;

/*
 * The mark: a navy tile holding three left-aligned bars of falling length,
 * a ranked shortlist that also reads as an abstract "F". The top choice is
 * blue, the runner-up white, and a short violet accent closes the list.
 * In mono the bars are knocked out of a single-colour tile.
 */
const BARS = [
  { y: 8.5, width: 16, color: "#4169E1" },
  { y: 14, width: 11, color: "#FFFFFF" },
  { y: 19.5, width: 4.5, color: "#7767D8" },
] as const;

export function LogoMarkSymbol({
  tone = "color",
  size = 28,
  className,
}: {
  tone?: "color" | "mono";
  size?: number;
  className?: string;
}) {
  const maskId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      {tone === "color" ? (
        <>
          <rect width="32" height="32" rx="6" fill="#17243A" />
          {BARS.map((bar) => (
            <rect key={bar.y} x="8" y={bar.y} width={bar.width} height="4" rx="1" fill={bar.color} />
          ))}
        </>
      ) : (
        <>
          <mask id={maskId}>
            <rect width="32" height="32" rx="6" fill="#FFFFFF" />
            {BARS.map((bar) => (
              <rect key={bar.y} x="8" y={bar.y} width={bar.width} height="4" rx="1" fill="#000000" />
            ))}
          </mask>
          <rect width="32" height="32" rx="6" fill="currentColor" mask={`url(#${maskId})`} />
        </>
      )}
    </svg>
  );
}

export function Logo({ tone = "color", markOnly = false, size = "md", className }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        tone === "color" ? "text-navy" : "text-current",
        className,
      )}
    >
      <LogoMarkSymbol tone={tone} size={markSizes[size]} />
      {markOnly ? (
        <span className="sr-only">{SITE_NAME}</span>
      ) : (
        <span
          className={cn(
            "leading-none font-semibold tracking-[-0.03em]",
            wordSizes[size],
          )}
        >
          {SITE_NAME}
        </span>
      )}
    </span>
  );
}
