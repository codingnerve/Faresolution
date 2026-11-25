"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LogoMark } from "@/components/ui/LogoMark";

export interface FinderProduct {
  slug: string;
  name: string;
  vendorName: string | null;
  brandColor: string;
}

export interface FinderGroup {
  slug: string;
  name: string;
  products: FinderProduct[];
}

const MAX_QUERY_LENGTH = 100;

/** Lower-cased, with runs of whitespace collapsed; never used as a pattern. */
function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Filterable list of products to find alternatives for, grouped by category.
 * Every link is in the server-rendered HTML; typing narrows the list by product,
 * vendor or category name (plain substring match).
 */
export function AlternativesFinder({
  groups,
  hrefBase = "/alternatives/",
  linkSuffix = " alternatives",
}: {
  groups: FinderGroup[];
  /** Each product links to `hrefBase + slug`; also used to start a review draft (`/reviews/write/`). */
  hrefBase?: string;
  /** Appended to the product name in each link (empty for a plain name). */
  linkSuffix?: string;
}) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const statusId = useId();
  const needle = normalise(query.slice(0, MAX_QUERY_LENGTH));

  const visible = useMemo(() => {
    if (needle === "") return groups;
    return groups
      .map((group) => {
        const categoryMatches = normalise(group.name).includes(needle);
        const products = categoryMatches
          ? group.products
          : group.products.filter(
              (p) => normalise(p.name).includes(needle) || (p.vendorName !== null && normalise(p.vendorName).includes(needle)),
            );
        return { ...group, products };
      })
      .filter((group) => group.products.length > 0);
  }, [groups, needle]);

  const total = visible.reduce((n, g) => n + g.products.length, 0);

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="max-w-xl">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy">
          Find a product
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            strokeWidth={2}
          />
          <input
            id={inputId}
            type="search"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_QUERY_LENGTH}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={statusId}
            placeholder="Product, vendor or category"
            className="h-11 w-full rounded-md border border-line-strong bg-surface pr-3 pl-9 text-sm text-ink shadow-card placeholder:text-subtle"
          />
        </div>
      </form>
      <p id={statusId} role="status" className="type-meta mt-3">
        {needle === "" ? `${total} products` : `${total} ${total === 1 ? "product matches" : "products match"}`}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No products match"
          description="Try a shorter name, a vendor, or a category such as CRM or accounting."
        />
      ) : (
        <div className="mt-8 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((group) => (
            <section key={group.slug} aria-labelledby={`${inputId}-${group.slug}`}>
              <h3 id={`${inputId}-${group.slug}`} className="type-label border-b border-line pb-2">
                {group.name}
              </h3>
              <ul className="divide-y divide-line">
                {group.products.map((p) => (
                  <li key={p.slug}>
                    <Link href={`${hrefBase}${p.slug}`} className="group flex items-center gap-3 rounded-xs py-2.5">
                      <LogoMark name={p.name} color={p.brandColor} size={28} className="shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9375rem] leading-5 font-medium text-ink group-hover:text-blue-ink">
                          {p.name}
                          {linkSuffix}
                        </span>
                        {p.vendorName && <span className="type-meta block truncate">by {p.vendorName}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
