"use client";

import { Check, Minus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { NO_REVIEWS, NOT_RATED, NOT_VERIFIED, type CompareRow } from "@/lib/compare/diff";
import { cn } from "@/lib/utils";

export interface CompareColumn {
  slug: string;
  name: string;
  vendorName: string | null;
  brandColor: string;
  href: string;
  /** Where "Remove" goes: the comparison without this product, or /compare. */
  removeHref: string;
}

export interface CompareRowGroup {
  key: string;
  label: string;
  rows: CompareRow[];
}

type CompareTableProps = {
  columns: CompareColumn[];
  groups: CompareRowGroup[];
};

const MISSING = new Set([NOT_VERIFIED, NOT_RATED, NO_REVIEWS, "Not listed"]);

/** Header height the sticky product bar sits under (the site header is h-16). */
const STICKY_TOP = 64;

/**
 * Side-by-side table: products as columns, facts as rows (row headers in the
 * first column, sticky while the table scrolls sideways on narrow screens).
 * Rows whose values differ are tinted and marked "Differs"; a switch hides
 * the rest. Once the table's own header scrolls away, a compact bar with the
 * product names sticks under the site header (visual only: the real header
 * row stays in the table for assistive tech).
 */
export function CompareTable({ columns, groups }: CompareTableProps) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [stuck, setStuck] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const switchId = useId();

  const n = columns.length;
  const allRows = groups.flatMap((g) => g.rows);
  const differing = allRows.filter((r) => r.differs).length;
  const shown = groups
    .map((g) => ({ ...g, rows: onlyDiff ? g.rows.filter((r) => r.differs) : g.rows }))
    .filter((g) => g.rows.length > 0);

  // Same column widths for the table and the sticky bar, so they line up.
  // Column minimums are small enough on phones that two products fit a 375px
  // screen; three or four scroll inside the table's own box.
  const widths = {
    "--cols": n,
    minWidth: "calc(var(--label-w) + var(--cols) * var(--col-min))",
  } as CSSProperties;
  const gridColumns = { gridTemplateColumns: `var(--label-w) repeat(${n}, minmax(0, 1fr))` };

  useEffect(() => {
    const head = headRef.current;
    const end = endRef.current;
    if (!head || !end || typeof IntersectionObserver === "undefined") return;
    let headGone = false;
    let endBelow = true;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const above = !entry.isIntersecting && entry.boundingClientRect.top < STICKY_TOP;
          if (entry.target === head) headGone = above;
          else endBelow = !above;
        }
        setStuck(headGone && endBelow);
      },
      { rootMargin: `-${STICKY_TOP}px 0px 0px 0px` },
    );
    observer.observe(head);
    observer.observe(end);
    return () => observer.disconnect();
  }, []);

  function syncScroll() {
    if (barRef.current && scrollRef.current) barRef.current.scrollLeft = scrollRef.current.scrollLeft;
  }

  return (
    <div className="[--col-min:6.5rem] [--label-w:7rem] sm:[--col-min:10.5rem] sm:[--label-w:11rem] lg:[--label-w:13rem]">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <label htmlFor={switchId} className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-navy">
          <input
            id={switchId}
            type="checkbox"
            role="switch"
            checked={onlyDiff}
            onChange={(event) => setOnlyDiff(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-navy peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow-card after:transition-transform peer-checked:after:translate-x-4"
          />
          Show only differences
        </label>
        <p className="type-meta tabular-nums">
          {differing} of {allRows.length} rows differ
        </p>
      </div>

      {/* Zero-height sticky anchor: the bar overlays the table instead of taking space. */}
      <div className="sticky z-20 mt-4 h-0" style={{ top: STICKY_TOP }}>
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-0 overflow-hidden border-x border-b border-line bg-surface shadow-raised transition-opacity duration-150",
            stuck ? "visible opacity-100" : "invisible opacity-0",
          )}
          ref={barRef}
        >
          <div className="grid w-full" style={{ ...widths, ...gridColumns }}>
            <div className="sticky left-0 bg-surface" />
            {columns.map((c) => (
              <div key={c.slug} className="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:px-4">
                <LogoMark name={c.name} color={c.brandColor} size={24} />
                <span className="truncate text-sm font-semibold text-navy">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={syncScroll}
        role="region"
        aria-label="Comparison table"
        tabIndex={0}
        className="overflow-x-auto rounded-lg border border-line"
      >
        <table className="w-full table-fixed border-collapse text-left" style={widths}>
          <caption className="sr-only">
            {columns.map((c) => c.name).join(" compared with ")}.{" "}
            {onlyDiff ? "Showing only the rows where the products differ." : 'Rows where the products differ are marked "Differs".'}
          </caption>
          <colgroup>
            <col style={{ width: "var(--label-w)" }} />
            {columns.map((c) => (
              <col key={c.slug} />
            ))}
          </colgroup>
          <thead ref={headRef} className="bg-surface-alt">
            <tr>
              <td className="sticky left-0 z-10 border-b border-line bg-surface-alt px-3 py-4 align-bottom sm:px-4">
                <span className="type-label">
                  {n} products
                </span>
              </td>
              {columns.map((c) => (
                <th key={c.slug} scope="col" className="border-b border-l border-line px-3 py-4 align-top font-normal sm:px-4">
                  <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-start sm:gap-3">
                    <LogoMark name={c.name} color={c.brandColor} size={40} className="size-9 sm:size-10" />
                    <div className="min-w-0">
                      <Link href={c.href} className="block rounded-xs text-[0.9375rem] leading-5 font-semibold [overflow-wrap:anywhere] text-navy hover:text-blue-ink">
                        {c.name}
                      </Link>
                      {c.vendorName && <p className="type-meta mt-0.5 truncate">by {c.vendorName}</p>}
                      <Link
                        href={c.removeHref}
                        aria-label={`Remove ${c.name} from this comparison`}
                        className="mt-1.5 inline-flex items-center gap-1 rounded-xs text-[0.8125rem] font-medium text-subtle hover:text-danger"
                      >
                        <X aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
                        Remove
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {shown.map((group) => (
            <tbody key={group.key}>
              <tr>
                <th scope="rowgroup" colSpan={n + 1} className="border-b border-line bg-surface px-3 pt-6 pb-2 text-left sm:px-4">
                  <span className="sticky left-3 inline-block type-label text-navy sm:left-4">{group.label}</span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.key} className={row.differs ? "bg-blue-tint" : "bg-surface"}>
                  <th
                    scope="row"
                    className={cn(
                      "sticky left-0 z-10 border-b border-line px-3 py-3 align-top text-[0.8125rem] leading-5 font-medium text-ink sm:px-4 sm:text-sm",
                      row.differs ? "bg-blue-tint" : "bg-surface",
                    )}
                  >
                    {row.label}
                    {row.differs && (
                      <span className="mt-1 flex w-fit items-center gap-1 rounded-xs bg-surface px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-blue-ink uppercase">
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-blue" />
                        Differs
                      </span>
                    )}
                  </th>
                  {row.cells.map((cell, i) => (
                    <td
                      key={columns[i]?.slug ?? i}
                      className={cn(
                        "border-b border-l border-line px-3 py-3 align-top text-[0.8125rem] leading-5 break-words sm:px-4 sm:text-sm",
                        MISSING.has(cell) ? "text-subtle" : "text-ink",
                      )}
                    >
                      {row.section === "features" ? <FeatureCell listed={cell === "Listed"} text={cell} /> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
          {shown.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={n + 1} className="px-4 py-8 text-center text-sm text-subtle">
                  These products match on every row we list. Turn off &ldquo;Show only differences&rdquo; to see all
                  rows.
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <div ref={endRef} aria-hidden="true" />
    </div>
  );
}

function FeatureCell({ listed, text }: { listed: boolean; text: string }) {
  const Icon = listed ? Check : Minus;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden="true" className={cn("size-4 shrink-0", listed ? "text-success" : "text-muted")} strokeWidth={2.25} />
      {text}
    </span>
  );
}
