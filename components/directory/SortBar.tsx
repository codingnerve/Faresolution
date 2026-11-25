"use client";

import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";
import { sortLabel } from "@/lib/directory/labels";
import type { DirectorySort, DirectoryView } from "@/lib/directory/query";
import { cn } from "@/lib/utils";
import { ViewToggle } from "./ViewToggle";

export interface SortBarProps {
  /** Products matching the filters. */
  total: number;
  /** 1-based index range shown on this page. */
  range: [number, number];
  sort: DirectorySort;
  /** Selectable sorts, or `null` when the route fixes the order. */
  sortOptions: DirectorySort[] | null;
  view: DirectoryView;
  onSortChange: (sort: DirectorySort) => void;
  onViewChange: (view: DirectoryView) => void;
  /** Slot before the controls, e.g. the mobile "Filters" button. */
  start?: ReactNode;
  className?: string;
}

const countFormat = new Intl.NumberFormat("en-US");

/** Result count, sort select and layout toggle above the listing. */
export function SortBar({
  total,
  range,
  sort,
  sortOptions,
  view,
  onSortChange,
  onViewChange,
  start,
  className,
}: SortBarProps) {
  const selectId = useId();
  const noun = total === 1 ? "product" : "products";
  const summary =
    total === 0
      ? "No products"
      : range[0] === 1 && range[1] === total
        ? `${countFormat.format(total)} ${noun}`
        : `Showing ${range[0]}–${range[1]} of ${countFormat.format(total)} ${noun}`;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-3", className)}>
      {start}
      <p className="mr-auto text-sm text-subtle" aria-live="polite" aria-atomic="true">
        {summary}
      </p>
      <div className="flex items-center gap-3">
        {sortOptions ? (
          <div className="flex items-center gap-2">
            <label htmlFor={selectId} className="text-sm text-subtle">
              Sort by
            </label>
            <span className="relative">
              <select
                id={selectId}
                value={sort}
                onChange={(e) => onSortChange(e.target.value as DirectorySort)}
                className="h-9 appearance-none rounded-md border border-line-strong bg-surface py-0 pr-8 pl-3 text-sm text-ink shadow-card hover:border-muted/60"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {sortLabel[option]}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
                strokeWidth={2}
              />
            </span>
          </div>
        ) : (
          <p className="text-sm text-subtle">
            Sorted by <span className="font-medium text-ink">{sortLabel[sort]}</span>
          </p>
        )}
        <ViewToggle view={view} onChange={onViewChange} />
      </div>
    </div>
  );
}
