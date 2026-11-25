import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Page numbers to show: first, last, and a window around the current page. */
export function pageItems(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (const n of sorted) {
    const prev = out[out.length - 1];
    if (typeof prev === "number" && n - prev === 2) out.push(prev + 1);
    else if (typeof prev === "number" && n - prev > 2) out.push("gap");
    out.push(n);
  }
  return out;
}

const item =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md px-3 text-sm font-medium transition-colors";

/**
 * Real links for every page, so pages work without JavaScript and keep the
 * other query params. Previous / next carry `rel`. Hidden for a single page.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  className,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-1">
        {page > 1 && (
          <li>
            <Link
              href={hrefFor(page - 1)}
              rel="prev"
              scroll={false}
              className={cn(item, "text-ink hover:bg-surface-alt")}
            >
              <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2} />
              <span>Previous</span>
            </Link>
          </li>
        )}
        {pageItems(page, pageCount).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-sm text-subtle">
              &hellip;
            </li>
          ) : (
            <li key={n}>
              <Link
                href={hrefFor(n)}
                scroll={false}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={cn(
                  item,
                  "tabular-nums",
                  n === page ? "bg-navy text-white" : "text-ink hover:bg-surface-alt",
                )}
              >
                {n}
              </Link>
            </li>
          ),
        )}
        {page < pageCount && (
          <li>
            <Link
              href={hrefFor(page + 1)}
              rel="next"
              scroll={false}
              className={cn(item, "text-ink hover:bg-surface-alt")}
            >
              <span>Next</span>
              <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
