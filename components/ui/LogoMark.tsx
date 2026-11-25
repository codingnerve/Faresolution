import { cn, getInitials, isLightColor } from "@/lib/utils";

type LogoMarkProps = {
  name: string;
  /** Brand colour as hex, e.g. "#4169E1". Invalid values fall back to navy. */
  color: string;
  size?: number;
  className?: string;
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Generated monogram tile for a product: initials on its brand colour.
 * Never a copy of a real logo. Decorative; the product name sits beside it.
 */
export function LogoMark({ name, color, size = 40, className }: LogoMarkProps) {
  const fill = HEX.test(color.trim())
    ? `#${color.trim().replace(/^#/, "")}`
    : "#17243A";
  const light = isLightColor(fill);
  const initials = getInitials(name);
  const fontSize = initials.length > 1 ? 14.5 : 17;
  // Keep the on-screen corner radius at or below 8px at any size.
  const radius = Math.min(8, size * 0.2) * (40 / size);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <rect width="40" height="40" rx={radius} fill={fill} />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx={Math.max(0, radius - 0.5)}
        fill="none"
        stroke={light ? "rgb(23 36 58 / 0.12)" : "rgb(255 255 255 / 0.10)"}
      />
      <text
        x="20"
        y="20"
        dy="0.35em"
        textAnchor="middle"
        fill={light ? "#17243A" : "#FFFFFF"}
        fontFamily="var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
        fontSize={fontSize}
        fontWeight={600}
        letterSpacing="-0.02em"
      >
        {initials}
      </text>
    </svg>
  );
}
