"use client";

import { LayoutGrid, List } from "lucide-react";
import type { DirectoryView } from "@/lib/directory/query";
import { cn } from "@/lib/utils";

const options: { value: DirectoryView; label: string; icon: typeof List }[] = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

/** Grid / list switch: two toggle buttons, the active one pressed. */
export function ViewToggle({
  view,
  onChange,
  className,
}: {
  view: DirectoryView;
  onChange: (view: DirectoryView) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Layout" className={cn("inline-flex rounded-md border border-line-strong bg-surface p-0.5", className)}>
      {options.map(({ value, label, icon: Icon }) => {
        const active = view === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(value)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-sm transition-colors",
              active ? "bg-navy text-white" : "text-subtle hover:bg-surface-alt hover:text-ink",
            )}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
