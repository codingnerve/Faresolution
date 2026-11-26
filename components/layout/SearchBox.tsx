"use client";

import { ArrowRight, Building2, LayoutGrid, Search, SearchX, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import {
  MAX_QUERY_LENGTH,
  popularSearches,
  search,
  type CategoryHit,
  type ProductHit,
  type SearchIndex,
  type VendorHit,
} from "@/lib/search";
import { cn } from "@/lib/utils";
import { categoryHref, productHref, softwareSearchHref } from "./navigation";
import { useSearchIndex } from "./SearchIndexProvider";

const LIMITS = { products: 6, categories: 4, vendors: 3 } as const;

type Option =
  | { kind: "product"; key: string; href: string; hit: ProductHit }
  | { kind: "category"; key: string; href: string; hit: CategoryHit }
  | { kind: "vendor"; key: string; href: string; hit: VendorHit }
  | { kind: "all"; key: string; href: string; query: string }
  | { kind: "popular"; key: string; term: string };

interface Group {
  key: string;
  label: string;
  options: Option[];
}

function buildGroups(index: SearchIndex, rawQuery: string): Group[] {
  const query = rawQuery.trim();
  if (query === "") {
    return [
      {
        key: "popular",
        label: "Popular searches",
        options: popularSearches.map((term) => ({ kind: "popular", key: `popular-${term}`, term })),
      },
    ];
  }

  const results = search(index, query, { limit: LIMITS.products });
  const groups: Group[] = [];
  if (results.products.length > 0) {
    groups.push({
      key: "products",
      label: "Products",
      options: results.products.map((hit) => ({
        kind: "product",
        key: `product-${hit.slug}`,
        href: productHref(hit.slug),
        hit,
      })),
    });
  }
  // Categories and brands with no listings would lead to empty pages.
  const categories = results.categories.filter((c) => c.productCount > 0).slice(0, LIMITS.categories);
  if (categories.length > 0) {
    groups.push({
      key: "categories",
      label: "Categories",
      options: categories.map((hit) => ({
        kind: "category",
        key: `category-${hit.slug}`,
        href: categoryHref(hit.slug),
        hit,
      })),
    });
  }
  const vendors = results.vendors.filter((v) => v.productCount > 0).slice(0, LIMITS.vendors);
  if (vendors.length > 0) {
    groups.push({
      key: "vendors",
      label: "Brands",
      options: vendors.map((hit) => ({
        kind: "vendor",
        key: `vendor-${hit.slug}`,
        href: softwareSearchHref(hit.name),
        hit,
      })),
    });
  }
  if (groups.length > 0) {
    groups.push({
      key: "all",
      label: "All results",
      options: [{ kind: "all", key: "all", href: softwareSearchHref(query), query }],
    });
  }
  return groups;
}

const countLabel = (n: number) => `${n} ${n === 1 ? "product" : "products"}`;

export interface SearchBoxProps {
  /**
   * Serialised index built on the server with `getSearchIndex()`. Defaults to
   * the shared index from `SearchIndexProvider` (set up in the root layout).
   */
  index?: SearchIndex;
  /**
   * `overlay`: results always shown below the input (header search panel).
   * `inline`: a search field whose results open in a dropdown while focused.
   */
  variant?: "overlay" | "inline";
  /** Input height for the `inline` variant; `lg` is the homepage hero field. */
  size?: "md" | "lg";
  placeholder?: string;
  /** Visually hidden label for the input. */
  label?: string;
  /** Focus the input on mount. */
  autoFocus?: boolean;
  /** Called after a result or free-text search navigates away. */
  onNavigate?: () => void;
  /** Called when Escape is pressed (the overlay uses this to close). */
  onEscape?: () => void;
  className?: string;
}

export function SearchBox({
  index: indexProp,
  variant = "inline",
  size = "md",
  placeholder = "Search software, categories or brands",
  label = "Search software",
  autoFocus = false,
  onNavigate,
  onEscape,
  className,
}: SearchBoxProps) {
  const sharedIndex = useSearchIndex();
  const index = indexProp ?? sharedIndex;
  if (!index) throw new Error("SearchBox needs an `index` prop or a <SearchIndexProvider>.");
  const router = useRouter();
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-option-${i}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inlineOpen, setInlineOpen] = useState(false);

  const groups = useMemo(() => buildGroups(index, query), [index, query]);
  const options = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const hasQuery = query.trim() !== "";
  const noMatches = hasQuery && options.length === 0;
  const open = variant === "overlay" || inlineOpen;
  const listVisible = open && options.length > 0;
  const active = activeIndex >= 0 && activeIndex < options.length ? activeIndex : -1;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (active >= 0) {
      document.getElementById(`${baseId}-option-${active}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [active, baseId]);

  function updateQuery(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    setInlineOpen(true);
  }

  function finish() {
    setInlineOpen(false);
    setActiveIndex(-1);
    onNavigate?.();
  }

  function go(href: string) {
    router.push(href);
    finish();
  }

  function choose(option: Option) {
    if (option.kind === "popular") {
      updateQuery(option.term);
      inputRef.current?.focus();
      return;
    }
    go(option.href);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active >= 0) {
      choose(options[active]);
    } else if (hasQuery) {
      go(softwareSearchHref(query));
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const count = options.length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setInlineOpen(true);
        if (count > 0) setActiveIndex(active < count - 1 ? active + 1 : 0);
        break;
      case "ArrowUp":
        event.preventDefault();
        setInlineOpen(true);
        if (count > 0) setActiveIndex(active > 0 ? active - 1 : count - 1);
        break;
      case "Escape":
        event.preventDefault();
        if (variant === "overlay") {
          onEscape?.();
        } else if (inlineOpen) {
          setInlineOpen(false);
          setActiveIndex(-1);
        } else if (query !== "") {
          updateQuery("");
          setInlineOpen(false);
        }
        break;
      // Enter submits the form (handled in `submit`).
    }
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (variant === "inline" && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setInlineOpen(false);
      setActiveIndex(-1);
    }
  }

  const overlay = variant === "overlay";
  const large = !overlay && size === "lg";

  return (
    <div className={cn("relative", className)} onBlur={onBlur}>
      <form role="search" action="/software" method="get" onSubmit={submit} className="relative">
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <Search
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted",
            overlay ? "left-0 size-5" : large ? "left-5 size-5" : "left-4 size-[1.125rem]",
          )}
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          type="text"
          inputMode="search"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={listVisible}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={listVisible && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={MAX_QUERY_LENGTH}
          placeholder={placeholder}
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => setInlineOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full bg-transparent text-ink placeholder:text-subtle",
            overlay
              ? // A bottom rule that turns blue (2px) while focused, in place of the outline ring.
                "h-14 border-b-2 border-transparent pr-10 pl-8 text-lg focus-visible:border-blue focus-visible:outline-none"
              : cn(
                  "rounded-md border border-line-strong bg-surface shadow-card transition-colors hover:border-muted/60 focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/25 focus-visible:outline-none",
                  large ? "h-14 pr-12 pl-13 text-base shadow-raised" : "h-12 pr-11 pl-11 text-[0.9375rem]",
                ),
          )}
        />
        {query !== "" && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              updateQuery("");
              inputRef.current?.focus();
            }}
            className={cn(
              "absolute top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-subtle hover:bg-surface-alt hover:text-ink",
              overlay ? "right-0" : large ? "right-3" : "right-2",
            )}
          >
            <X aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        )}
      </form>

      <p className="sr-only" aria-live="polite">
        {hasQuery
          ? noMatches
            ? "No matches."
            : `${options.length - 1} suggestions available.`
          : ""}
      </p>

      {open && (
        <div
          className={cn(
            // Inline dropdown: z-[35] sits above the compare tray (z-30) but
            // below the sticky header and its menus (z-40, which a tie would
            // lose to this later element) and the portalled drawers (z-50).
            overlay
              ? "mt-2 border-t border-line pt-3"
              : "absolute inset-x-0 top-full z-[35] mt-2 rounded-lg border border-line bg-surface p-2 shadow-overlay",
          )}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            hidden={!listVisible}
            className={cn("overflow-y-auto overscroll-contain", overlay ? "max-h-[min(60vh,30rem)]" : "max-h-[min(60vh,26rem)]")}
          >
            {groups.map((group) => {
              const headingId = `${baseId}-group-${group.key}`;
              return (
                <div key={group.key} role="group" aria-labelledby={headingId} className="py-1.5">
                  <div
                    id={headingId}
                    className={cn("px-3 pb-1.5 type-label", group.key === "all" && "sr-only")}
                  >
                    {group.label}
                  </div>
                  {group.options.map((option) => {
                    const i = options.indexOf(option);
                    return (
                      <OptionRow
                        key={option.key}
                        id={optionId(i)}
                        option={option}
                        active={i === active}
                        onHover={() => setActiveIndex(i)}
                        onChoose={() => choose(option)}
                        onLinkClick={finish}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          {noMatches && (
            <div className="flex items-start gap-3 px-3 py-4 text-sm">
              <SearchX aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" strokeWidth={1.75} />
              <div>
                <p className="font-medium text-ink">
                  No matches for &ldquo;{query.trim()}&rdquo;
                </p>
                <p className="mt-1 text-subtle">
                  Check the spelling, try a broader term, or{" "}
                  <Link
                    href="/categories"
                    onClick={finish}
                    className="font-medium text-blue-ink underline decoration-blue/30 underline-offset-4 hover:decoration-blue"
                  >
                    browse all categories
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  id,
  option,
  active,
  onHover,
  onChoose,
  onLinkClick,
}: {
  id: string;
  option: Option;
  active: boolean;
  onHover: () => void;
  onChoose: () => void;
  onLinkClick: () => void;
}) {
  const rowClass = cn(
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-ink",
    active && "bg-surface-alt",
  );
  const common = {
    id,
    role: "option" as const,
    "aria-selected": active,
    tabIndex: -1,
    // Keep focus in the input so the list stays open through the click.
    onMouseDown: (e: { preventDefault: () => void }) => e.preventDefault(),
    onMouseMove: () => {
      if (!active) onHover();
    },
  };

  if (option.kind === "popular") {
    return (
      <button type="button" {...common} onClick={onChoose} className={rowClass}>
        <TrendingUp aria-hidden="true" className="size-4 shrink-0 text-muted" strokeWidth={2} />
        <span>{option.term}</span>
      </button>
    );
  }

  let body: ReactNode;
  switch (option.kind) {
    case "product":
      body = (
        <>
          <LogoMark name={option.hit.name} color={option.hit.brandColor} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{option.hit.name}</span>
            <span className="block truncate text-[0.8125rem] text-subtle">
              {[option.hit.vendorName, option.hit.primaryCategoryName].filter(Boolean).join(" · ")}
            </span>
          </span>
        </>
      );
      break;
    case "category":
      body = (
        <>
          <IconTile>
            <LayoutGrid className="size-4" strokeWidth={1.75} />
          </IconTile>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{option.hit.name}</span>
            <span className="block text-[0.8125rem] text-subtle">{countLabel(option.hit.productCount)}</span>
          </span>
        </>
      );
      break;
    case "vendor":
      body = (
        <>
          <IconTile>
            <Building2 className="size-4" strokeWidth={1.75} />
          </IconTile>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{option.hit.name}</span>
            <span className="block text-[0.8125rem] text-subtle">{countLabel(option.hit.productCount)}</span>
          </span>
        </>
      );
      break;
    case "all":
      body = (
        <>
          <IconTile>
            <Search className="size-4" strokeWidth={1.75} />
          </IconTile>
          <span className="min-w-0 flex-1 truncate">
            Search all software for{" "}
            <span className="font-medium">&ldquo;{option.query}&rdquo;</span>
          </span>
          <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted" strokeWidth={2} />
        </>
      );
      break;
  }

  return (
    <Link href={option.href} {...common} onClick={onLinkClick} className={rowClass}>
      {body}
    </Link>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-subtle"
    >
      {children}
    </span>
  );
}
