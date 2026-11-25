"use client";

import { SearchX, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchIndex } from "@/components/layout/SearchIndexProvider";
import { ProductRow } from "@/components/product/ProductRow";
import { ProductTile } from "@/components/product/ProductTile";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DirectoryData } from "@/lib/directory/data";
import { directoryHref, effectiveQuery, isPageOnlyChange, type DirectoryPreset } from "@/lib/directory/preset";
import {
  applyQuery,
  DEFAULT_QUERY,
  facetCounts,
  PAGE_SIZE,
  paginate,
  parseQuery,
  type DirectoryContext,
  type DirectoryQuery,
  type DirectorySort,
  type RawParams,
} from "@/lib/directory/query";
import { ActiveFilters, activeChips } from "./ActiveFilters";
import { FilterDrawer } from "./FilterDrawer";
import { FilterPanel, type QueryPatch } from "./FilterPanel";
import { Pagination } from "./Pagination";
import { SortBar } from "./SortBar";

export interface DirectoryViewProps {
  data: DirectoryData;
  preset: DirectoryPreset;
  /** URL query params (from `useSearchParams`, or `{}` for the static fallback). */
  params: RawParams;
}

/**
 * The directory listing: filters, chips, sort, layout toggle, results and
 * pagination, all derived from `params`. Changes are written back to the URL
 * with `router.replace`, so every state is a shareable link.
 */
export function DirectoryView({ data, preset, params }: DirectoryViewProps) {
  const router = useRouter();
  const searchIndex = useSearchIndex();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { products, labels, categoryChildren, ratingsAvailable } = data;
  const locked = preset.locked;
  const lockedKeys = Object.keys(locked ?? {});

  const query = useMemo(
    () => effectiveQuery(parseQuery(params), locked, { ratingsAvailable }),
    [params, locked, ratingsAvailable],
  );
  const ctx = useMemo<DirectoryContext>(() => ({ searchIndex, categoryChildren }), [searchIndex, categoryChildren]);
  const results = useMemo(() => applyQuery(products, query, ctx), [products, query, ctx]);
  const facets = useMemo(() => facetCounts(products, query, ctx), [products, query, ctx]);
  const flagCounts = useMemo(
    () => ({
      freePlan: applyQuery(products, { ...query, freePlan: true }, ctx).length,
      freeTrial: applyQuery(products, { ...query, freeTrial: true }, ctx).length,
    }),
    [products, query, ctx],
  );
  const current = paginate(results, query.page);
  const chips = activeChips(query, labels, lockedKeys);

  const sortOptions: DirectorySort[] | null =
    locked?.sort !== undefined
      ? null
      : [
          ...(query.q ? (["relevance"] as const) : []),
          "name" as const,
          "newest" as const,
          "trending" as const,
          ...(ratingsAvailable ? (["rating"] as const) : []),
        ];
  // Without a keyword, "relevance" is name order: show it as such in the select.
  const shownSort: DirectorySort = !query.q && query.sort === "relevance" ? "name" : query.sort;

  const navigate = useCallback(
    (next: DirectoryQuery) => router.replace(directoryHref(preset, next), { scroll: false }),
    [router, preset],
  );

  /** Apply a change; any filter change returns to page 1. */
  const update = useCallback(
    (patch: QueryPatch, { keepPage = false } = {}) => {
      const next: DirectoryQuery = { ...query, ...patch };
      for (const key of Object.keys(patch) as (keyof DirectoryQuery)[]) {
        if (next[key] === undefined) delete next[key];
      }
      if (!keepPage) next.page = 1;
      navigate(next);
    },
    [query, navigate],
  );

  const clearAll = useCallback(
    () => navigate({ ...DEFAULT_QUERY, sort: query.sort, view: query.view }),
    [navigate, query.sort, query.view],
  );

  // After pagination (and only then: a filter change also resets the page, and
  // must not steal focus from its control), bring the results into view and
  // move focus to them. Compares the shown page, so clamped URLs count too.
  const shownQuery = useMemo(() => ({ ...query, page: current.page }), [query, current.page]);
  const previousQuery = useRef(shownQuery);
  useEffect(() => {
    const prev = previousQuery.current;
    previousQuery.current = shownQuery;
    if (!isPageOnlyChange(prev, shownQuery)) return;
    const el = resultsRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ block: "start" });
    }
    el?.focus({ preventScroll: true });
  }, [shownQuery]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const filterCount = chips.length;
  const first = current.total === 0 ? 0 : (current.page - 1) * PAGE_SIZE + 1;
  const last = first === 0 ? 0 : first + current.items.length - 1;
  const unknownCategory =
    query.category !== undefined && !labels.categories.some((c) => c.slug === query.category);

  const panel = (
    <FilterPanel
      query={query}
      facets={facets}
      flagCounts={flagCounts}
      labels={labels}
      ratingsAvailable={ratingsAvailable}
      locked={locked}
      onChange={(patch) => update(patch)}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10">
      {current.page > 1 && <meta name="robots" content="noindex,follow" />}

      <aside aria-label="Filters" className="hidden lg:block">
        <h2 className="sr-only">Filters</h2>
        {panel}
      </aside>

      <div className="min-w-0">
        <div className="space-y-4 border-b border-line pb-4">
          <SortBar
            total={current.total}
            range={[first, last]}
            sort={shownSort}
            sortOptions={sortOptions}
            view={query.view}
            onSortChange={(sort) => update({ sort })}
            onViewChange={(view) => update({ view }, { keepPage: true })}
            start={
              <button
                ref={filtersButtonRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-card hover:bg-surface-alt lg:hidden"
              >
                <SlidersHorizontal aria-hidden="true" className="size-4" strokeWidth={1.75} />
                Filters
                {filterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-navy px-1 text-xs text-white tabular-nums">
                    {filterCount}
                  </span>
                )}
              </button>
            }
          />
          <ActiveFilters
            chips={chips}
            onRemove={(patch) => update(patch)}
            onClearAll={clearAll}
            fallbackFocusRef={resultsRef}
          />
        </div>

        <div ref={resultsRef} tabIndex={-1} className="scroll-mt-24 pt-6 focus:outline-none">
          <h2 className="sr-only">Results</h2>
          {current.total === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No software matches these filters"
              description={
                unknownCategory
                  ? "We don't list a category with that name. Clear the filters to see every product, or pick a category from the list."
                  : "Try removing a filter or using a broader keyword."
              }
              action={
                chips.length > 0 ? (
                  <Button variant="secondary" onClick={clearAll}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          ) : query.view === "list" ? (
            <ul className="space-y-4">
              {current.items.map((p) => (
                <li key={p.slug}>
                  <ProductRow product={p} vendorName={p.vendorName} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {current.items.map((p) => (
                <li key={p.slug}>
                  <ProductTile product={p} vendorName={p.vendorName} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            className="mt-10"
            page={current.page}
            pageCount={current.pageCount}
            hrefFor={(page) => directoryHref(preset, { ...query, page })}
          />
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        returnFocusRef={filtersButtonRef}
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            {chips.length > 0 && (
              <Button variant="ghost" onClick={clearAll}>
                Clear all
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={() => {
                setDrawerOpen(false);
                filtersButtonRef.current?.focus();
              }}
            >
              {current.total === 0
                ? "Close"
                : `Show ${current.total} ${current.total === 1 ? "result" : "results"}`}
            </Button>
          </div>
        }
      >
        {panel}
      </FilterDrawer>
    </div>
  );
}
