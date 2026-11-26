"use client";

import { Search } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSearchIndex } from "@/components/layout/SearchIndexProvider";
import { LogoMark } from "@/components/ui/LogoMark";
import { search } from "@/lib/search";
import { cn } from "@/lib/utils";

const RESULT_LIMIT = 8;

type ProductSearchFieldProps = {
  label: string;
  /** Slugs that cannot be picked (already selected). */
  exclude: readonly string[];
  onSelect: (slug: string) => void;
  /** Shown under the field and disables it. */
  disabledReason?: string | null;
  placeholder?: string;
  className?: string;
  /** Id for the input (so a form can focus it or link to it); generated when omitted. */
  inputId?: string;
  /** Marks the input invalid (a form's inline error). */
  invalid?: boolean;
  /** Extra ids that describe the input, such as a form's hint and error. */
  describedBy?: string;
};

/**
 * Product-only search combobox over the shared search index (the same index
 * the header search uses). Arrow keys move through results, Enter picks the
 * highlighted one (or the first), Escape clears.
 */
export function ProductSearchField({
  label,
  exclude,
  onSelect,
  disabledReason = null,
  placeholder = "Search by product, vendor or category",
  className,
  inputId,
  invalid = false,
  describedBy,
}: ProductSearchFieldProps) {
  const index = useSearchIndex();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const disabled = Boolean(disabledReason) || index === null;

  const results = useMemo(() => {
    if (!index || query.trim() === "") return [];
    const excluded = new Set(exclude);
    // Ask for a few extra so excluded products do not shrink the list.
    return search(index, query, { limit: RESULT_LIMIT + excluded.size })
      .products.filter((p) => !excluded.has(p.slug))
      .slice(0, RESULT_LIMIT);
  }, [index, query, exclude]);

  const hasQuery = query.trim() !== "";
  const expanded = open && hasQuery && !disabled;
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;
  const controlId = inputId ?? `${id}-input`;
  const describedByIds = [disabledReason ? hintId : null, describedBy].filter(Boolean).join(" ") || undefined;
  const optionId = (i: number) => `${id}-option-${i}`;
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  function pick(slug: string) {
    onSelect(slug);
    setQuery("");
    setActive(0);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (results.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + step + results.length) % results.length);
    } else if (event.key === "Enter") {
      // With a query, Enter belongs to this field: it picks a result or does
      // nothing, and never submits a surrounding form (e.g. the claim form).
      if (!hasQuery) return;
      event.preventDefault();
      if (expanded && results.length > 0) pick(results[activeIndex].slug);
    } else if (event.key === "Escape") {
      if (query === "" && !open) return;
      event.preventDefault();
      setQuery("");
      setOpen(false);
    }
  }

  const status = !hasQuery
    ? ""
    : results.length === 0
      ? "No products match."
      : `${results.length} ${results.length === 1 ? "product" : "products"} found. Use the arrow keys to choose.`;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={controlId} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          id={controlId}
          type="search"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          maxLength={100}
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && results.length > 0 ? optionId(activeIndex) : undefined}
          aria-describedby={describedByIds}
          aria-invalid={invalid ? true : undefined}
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-md border border-line-strong bg-surface pr-3 pl-9 text-[0.9375rem] text-ink shadow-card placeholder:text-subtle focus:border-blue focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue aria-[invalid=true]:border-danger disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-70"
        />
      </div>
      {disabledReason && (
        <p id={hintId} className="type-meta mt-1.5">
          {disabledReason}
        </p>
      )}

      <ul
        id={listId}
        role="listbox"
        aria-label={`${label}: results`}
        hidden={!expanded}
        className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface p-1.5 shadow-overlay"
      >
        {results.map((product, i) => (
          <li
            key={product.slug}
            id={optionId(i)}
            role="option"
            aria-selected={i === activeIndex}
            // Keep focus in the input so the click lands.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(product.slug)}
            onMouseMove={() => setActive(i)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2",
              i === activeIndex && "bg-surface-alt",
            )}
          >
            <LogoMark name={product.name} color={product.brandColor} size={28} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-navy">{product.name}</span>
              <span className="type-meta block truncate">
                {[product.vendorName, product.primaryCategoryName].filter(Boolean).join(" · ")}
              </span>
            </span>
          </li>
        ))}
        {results.length === 0 && hasQuery && (
          <li role="presentation" className="type-meta px-2.5 py-2">
            No products match &ldquo;{query.trim()}&rdquo;.
          </li>
        )}
      </ul>
      <p role="status" className="sr-only">
        {expanded ? status : ""}
      </p>
    </div>
  );
}
