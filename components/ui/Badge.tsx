import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "blue" | "violet" | "success" | "sponsored";

const tones: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-alt text-subtle",
  blue: "border-blue/15 bg-blue-tint text-blue-ink",
  violet: "border-violet/15 bg-violet-tint text-violet-ink",
  success: "border-success/15 bg-success-tint text-success",
  sponsored: "border-sponsored/15 bg-sponsored-tint text-sponsored",
};

type BadgeProps = ComponentProps<"span"> & { tone?: BadgeTone };

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm border px-2 text-xs leading-none font-medium whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
