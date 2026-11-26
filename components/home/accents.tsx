import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Homepage accent families, as full class names so Tailwind can see them.
 * Rotated through lists so each item gets its own colour.
 */
export const ACCENTS = [
  {
    solid: "bg-blue",
    tint: "bg-blue-tint",
    ink: "text-blue-ink",
    light: "text-blue-light",
    rule: "border-blue/25",
    hoverTint: "hover:bg-blue-tint/45",
  },
  {
    solid: "bg-violet",
    tint: "bg-violet-tint",
    ink: "text-violet-ink",
    light: "text-violet-light",
    rule: "border-violet/25",
    hoverTint: "hover:bg-violet-tint/50",
  },
  {
    solid: "bg-teal",
    tint: "bg-teal-tint",
    ink: "text-teal-ink",
    light: "text-teal-light",
    rule: "border-teal/25",
    hoverTint: "hover:bg-teal-tint/50",
  },
  {
    solid: "bg-coral",
    tint: "bg-coral-tint",
    ink: "text-coral-ink",
    light: "text-coral-light",
    rule: "border-coral/25",
    hoverTint: "hover:bg-coral-tint/50",
  },
  {
    solid: "bg-amber",
    tint: "bg-amber-tint",
    ink: "text-amber-ink",
    light: "text-amber-light",
    rule: "border-amber/30",
    hoverTint: "hover:bg-amber-tint/55",
  },
] as const;

export type Accent = (typeof ACCENTS)[number];
export type AccentName = "blue" | "violet" | "teal" | "coral" | "amber";

const BY_NAME: Record<AccentName, Accent> = {
  blue: ACCENTS[0],
  violet: ACCENTS[1],
  teal: ACCENTS[2],
  coral: ACCENTS[3],
  amber: ACCENTS[4],
};

export const accentAt = (index: number): Accent => ACCENTS[index % ACCENTS.length];
export const accent = (name: AccentName): Accent => BY_NAME[name];

/** Section eyebrow with a colour dot; sits inside a `type-label` element. */
export function Eyebrow({ tone, onDark, children }: { tone: AccentName; onDark?: boolean; children: ReactNode }) {
  const a = accent(tone);
  return (
    <span className={cn("inline-flex items-center gap-2", onDark ? a.light : a.ink)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", a.solid)} />
      {children}
    </span>
  );
}
