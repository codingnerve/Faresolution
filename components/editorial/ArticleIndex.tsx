"use client";

import { Search, SearchX, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { filterArticles, type ArticleCardData } from "@/lib/editorial";
import { cn } from "@/lib/utils";
import { ArticleCard, FeaturedArticle } from "./cards";

export interface ArticleIndexProps {
  /** Lead story shown while no filter is active; also searchable. */
  lead: ArticleCardData | null;
  /** Every other article, newest first. */
  rest: ArticleCardData[];
  /** Category labels for the filter chips; chips are hidden when fewer than two. */
  labels: string[];
  /** Nouns for counts and copy, e.g. { one: "guide", other: "guides" }. */
  nouns: { one: string; other: string };
}

const MAX_QUERY = 200;

/**
 * Index listing with a title search and category chips, filtered in the
 * browser (state is local, so the page itself stays fully static). With no
 * filter it shows the lead story and the grid; with one, every match.
 */
export function ArticleIndex({ lead, rest, labels, nouns }: ArticleIndexProps) {
  const noun = nouns.other;
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState<string | null>(null);
  const searchId = useId();
  const all = useMemo(() => (lead ? [lead, ...rest] : rest), [lead, rest]);
  const filtering = query.trim() !== "" || label !== null;
  const matches = useMemo(() => filterArticles(all, { query, label }), [all, query, label]);
  const showChips = labels.length > 1;

  const clear = () => {
    setQuery("");
    setLabel(null);
  };

  if (all.length === 0) {
    return (
      <EmptyState
        title={`No ${noun} published yet`}
        description="This section is ready, but nothing has been published in it. Browse the other resources in the meantime."
      />
    );
  }

  return (
    <div>
      <div
        role="search"
        aria-label={`Search and filter ${noun}`}
        className="flex flex-col gap-4 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between"
      >
        {showChips ? (
          <div role="group" aria-label="Filter by topic" className="-mx-1 flex flex-wrap gap-2 px-1">
            <Chip pressed={label === null} onClick={() => setLabel(null)}>
              All topics
            </Chip>
            {labels.map((l) => (
              <Chip key={l} pressed={label === l} onClick={() => setLabel(label === l ? null : l)}>
                {l}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="type-meta">
            {all.length} {all.length === 1 ? nouns.one : nouns.other}, newest first
          </p>
        )}
        <div className="relative w-full lg:max-w-xs">
          <label htmlFor={searchId} className="sr-only">
            Search {noun} by title
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            strokeWidth={2}
          />
          <input
            id={searchId}
            type="search"
            value={query}
            maxLength={MAX_QUERY}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles"
            autoComplete="off"
            className="h-10 w-full rounded-md border border-line-strong bg-surface pr-9 pl-9 text-sm text-ink shadow-card placeholder:text-subtle focus:border-blue focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue [&::-webkit-search-cancel-button]:hidden"
          />
          {query !== "" && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-subtle hover:bg-surface-alt hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className={cn("type-meta mt-5", !filtering && "sr-only")}>
        {filtering ? `${matches.length} of ${all.length} ${all.length === 1 ? nouns.one : nouns.other}` : ""}
      </p>

      {filtering ? (
        matches.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={SearchX}
            title={`No ${noun} match`}
            description="Try fewer or different words, or another topic. Search looks at titles only."
            action={
              <button
                type="button"
                onClick={clear}
                className="text-sm font-medium text-blue-ink underline decoration-blue/30 underline-offset-4 hover:decoration-blue"
              >
                Clear search and filters
              </button>
            }
          />
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((item) => (
              <li key={item.slug}>
                <ArticleCard item={item} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="mt-8 space-y-10">
          {lead && <FeaturedArticle item={lead} />}
          {rest.length > 0 && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item) => (
                <li key={item.slug}>
                  <ArticleCard item={item} headingLevel="h2" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-md border px-3 text-[0.8125rem] font-medium transition-colors duration-150",
        pressed
          ? "border-navy bg-navy text-white"
          : "border-line-strong bg-surface text-ink hover:border-muted/60 hover:bg-surface-alt",
      )}
    >
      {children}
    </button>
  );
}
