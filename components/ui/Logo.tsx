import { useId } from "react";
import { cn, SITE_NAME } from "@/lib/utils";
import { SITE_TAGLINE } from "@/lib/site";

type LogoProps = {
  /** `color` uses the brand palette; `mono` renders in `currentColor` only. */
  tone?: "color" | "mono";
  /** Hide the wordmark to show the mark alone (the name stays for screen readers). */
  markOnly?: boolean;
  /** Show the tagline underneath the wordmark, matching the primary horizontal lockup. */
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markWidths = { sm: 26, md: 34, lg: 48 } as const;
const dividerHeights = { sm: "h-5", md: "h-7", lg: "h-10" } as const;
const wordSizes = {
  sm: "text-[1rem]",
  md: "text-[1.25rem]",
  lg: "text-[1.75rem]",
} as const;
const taglineSizes = {
  sm: "text-[0.5rem]",
  md: "text-[0.5625rem]",
  lg: "text-[0.75rem]",
} as const;

/*
 * Two-ribbon flowing "F" wing mark: dark navy upper blade over a royal-blue
 * gradient lower wing. Works cleanly on light surfaces and in single-colour
 * (`mono`) mode via currentColor luminance contrast.
 */
const TOP_WING_PATH =
  "M 34.4 2.4 L 13.0 2.4 C 8.4 2.4 5.5 5.2 3.2 10.6 L 1.4 15.2 L 1.7 15.4 C 4.5 12.6 7.8 9.2 13.2 9.0 L 26.8 9.0 C 29.0 9.0 30.2 8.2 31.6 6.2 Z";
const BOTTOM_WING_PATH =
  "M 29.3 11.4 L 13.4 11.4 C 9.4 11.4 6.8 14.1 4.4 19.6 L 0.9 28.2 L 1.3 28.4 C 5.1 26.6 7.8 25.0 9.6 22.4 L 11.4 19.7 C 12.3 18.4 13.2 17.8 15.0 17.8 L 22.0 17.8 C 24.4 17.8 25.7 17.0 27.1 14.8 Z";

export function LogoMarkSymbol({
  tone = "color",
  size = 34,
  className,
}: {
  tone?: "color" | "mono";
  size?: number;
  className?: string;
}) {
  const gradId = useId();
  const height = Math.round((size * 30) / 36);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 36 30"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      {tone === "color" ? (
        <>
          <defs>
            <linearGradient id={gradId} x1="29" y1="11" x2="2" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0C5CE8" />
              <stop offset="55%" stopColor="#0246AA" />
              <stop offset="100%" stopColor="#03266B" />
            </linearGradient>
          </defs>
          <path d={TOP_WING_PATH} fill="#001740" />
          <path d={BOTTOM_WING_PATH} fill={`url(#${gradId})`} />
        </>
      ) : (
        <>
          <path d={TOP_WING_PATH} fill="currentColor" />
          <path d={BOTTOM_WING_PATH} fill="currentColor" fillOpacity={0.76} />
        </>
      )}
    </svg>
  );
}

export function Logo({
  tone = "color",
  markOnly = false,
  showTagline = false,
  size = "md",
  className,
}: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        size === "lg" ? "gap-3.5" : "gap-2.5",
        tone === "color" ? "text-[#001740]" : "text-current",
        className,
      )}
    >
      <LogoMarkSymbol tone={tone} size={markWidths[size]} />
      {markOnly ? (
        <span className="sr-only">{SITE_NAME}</span>
      ) : (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "w-px shrink-0",
              dividerHeights[size],
              tone === "color" ? "bg-[#94A3B8]/60" : "bg-current/30",
            )}
          />
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                "leading-none font-bold tracking-[-0.03em]",
                wordSizes[size],
              )}
            >
              <span>Fare</span>
              <span className={tone === "color" ? "text-[#0047AB]" : "opacity-85"}>solution</span>
            </span>
            {showTagline && (
              <span
                className={cn(
                  "mt-1 leading-none font-normal tracking-[0.04em]",
                  taglineSizes[size],
                  tone === "color" ? "text-subtle" : "opacity-75",
                )}
              >
                {SITE_TAGLINE}
              </span>
            )}
          </span>
        </>
      )}
    </span>
  );
}
