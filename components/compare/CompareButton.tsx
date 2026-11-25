"use client";

import { Check, Plus } from "lucide-react";
import { useId } from "react";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { COMPARE_FULL_MESSAGE, useCompare } from "@/lib/compare/useCompare";
import { cn } from "@/lib/utils";

type CompareButtonProps = {
  slug: string;
  name: string;
  size?: ButtonSize;
  className?: string;
};

/**
 * Adds a product to the compare tray or removes it. The accessible name stays
 * "Compare <product>" and `aria-pressed` carries the state. When the tray is
 * full and this product is not in it, the button is marked disabled (but stays
 * focusable) and a click explains why in the tray.
 *
 * Renders as "not selected" on the server and during hydration; the stored
 * selection applies right after (see `useCompare`).
 */
export function CompareButton({ slug, name, size = "sm", className }: CompareButtonProps) {
  const { slugs, add, remove, isFull } = useCompare();
  const selected = slugs.includes(slug);
  const blocked = !selected && isFull;
  const reasonId = useId();
  const Icon = selected ? Check : Plus;

  return (
    <>
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`Compare ${name}`}
        aria-disabled={blocked || undefined}
        aria-describedby={blocked ? reasonId : undefined}
        title={blocked ? COMPARE_FULL_MESSAGE : selected ? `Remove ${name} from compare` : `Add ${name} to compare`}
        onClick={() => {
          if (selected) remove(slug);
          else add(slug);
        }}
        className={cn(
          buttonClasses({ variant: "secondary", size }),
          // Stay clickable when full so the click can explain why.
          "aria-disabled:pointer-events-auto aria-disabled:cursor-not-allowed",
          selected && "border-navy/40 bg-blue-tint text-navy hover:bg-blue-tint",
          className,
        )}
      >
        <Icon aria-hidden="true" strokeWidth={2.25} />
        Compare
      </button>
      {blocked && (
        <span id={reasonId} hidden>
          {COMPARE_FULL_MESSAGE}
        </span>
      )}
    </>
  );
}
