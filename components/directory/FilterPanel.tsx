"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import type { DirectoryLabels } from "@/lib/directory/data";
import {
  companySizeLabel,
  deploymentLabel,
  labelFor,
  pricingModelLabel,
} from "@/lib/directory/labels";
import type { DirectoryPreset, LockedQuery } from "@/lib/directory/preset";
import type { DirectoryQuery, FacetCounts, FacetValue } from "@/lib/directory/query";
import { MAX_QUERY_LENGTH } from "@/lib/search";
import { cn } from "@/lib/utils";

export type QueryPatch = Partial<DirectoryQuery>;

export interface FilterPanelProps {
  query: DirectoryQuery;
  facets: FacetCounts;
  /** Result counts if the free plan / free trial checkbox were ticked. */
  flagCounts: { freePlan: number; freeTrial: number };
  labels: DirectoryLabels;
  ratingsAvailable: boolean;
  locked?: LockedQuery;
  /** Set on a category page: only the category's subcategories are offered. */
  scope?: DirectoryPreset["scope"];
  onChange: (patch: QueryPatch) => void;
  className?: string;
}

const RATING_STEPS = [4.5, 4, 3.5, 3];
const LIST_PREVIEW = 8;

/**
 * Directory filters. Every control applies immediately through `onChange`;
 * values with no matching products are hidden unless selected. Used in the
 * desktop sidebar and the mobile slide-over.
 */
export function FilterPanel({
  query,
  facets,
  flagCounts,
  labels,
  ratingsAvailable,
  locked,
  scope,
  onChange,
  className,
}: FilterPanelProps) {
  const ids = useId();
  const categoryName = new Map(labels.categories.map((c) => [c.slug, c.name]));
  const industryName = new Map(labels.industries.map((i) => [i.slug, i.name]));
  const featureName = new Map(labels.features.map((f) => [f.slug, f.name]));
  const integrationName = new Map(labels.integrations.map((i) => [i.slug, i.name]));

  const categoryCount = new Map(facets.category.map((f) => [f.value, f.count]));
  const shownCategory = (slug: string) => (categoryCount.get(slug) ?? 0) > 0 || slug === query.category;
  const categoryOption = (slug: string, name: string) => (
    <option key={slug} value={slug}>
      {name} ({categoryCount.get(slug) ?? 0})
    </option>
  );
  // A root with children becomes an <optgroup> (the root itself is its first
  // option, "All <root>"); a root without children is a plain option.
  const categoryTree = labels.categories
    .filter((c) => c.parentSlug === null && shownCategory(c.slug))
    .map((root) => {
      const children = labels.categories.filter((c) => c.parentSlug === root.slug && shownCategory(c.slug));
      if (children.length === 0) return categoryOption(root.slug, root.name);
      return (
        <optgroup key={root.slug} label={root.name}>
          {categoryOption(root.slug, `All ${root.name}`)}
          {children.map((c) => categoryOption(c.slug, c.name))}
        </optgroup>
      );
    });
  const unknownCategory = query.category !== undefined && !categoryName.has(query.category);
  const subcategories = scope
    ? labels.categories.filter((c) => c.parentSlug === scope.category && shownCategory(c.slug))
    : [];

  return (
    <div className={cn("divide-y divide-line", className)}>
      <KeywordSearch value={query.q} onSubmit={(q) => onChange({ q })} />

      {scope ? (
        subcategories.length > 0 && (
          <Section title="Subcategory">
            <Select
              id={`${ids}-category`}
              label="Subcategory"
              value={query.category ?? ""}
              onChange={(v) => onChange({ category: v || undefined })}
            >
              <option value="">{`All of ${scope.name}`}</option>
              {subcategories.map((c) => categoryOption(c.slug, c.name))}
            </Select>
          </Section>
        )
      ) : (
        <Section title="Category">
          <Select
            id={`${ids}-category`}
            label="Category"
            value={query.category ?? ""}
            onChange={(v) => onChange({ category: v || undefined })}
          >
            <option value="">All categories</option>
            {unknownCategory && <option value={query.category}>Unknown category (0)</option>}
            {categoryTree}
          </Select>
        </Section>
      )}

      <Section title="Pricing">
        <Select
          id={`${ids}-price`}
          label="Pricing model"
          visibleLabel
          value={query.priceModel ?? ""}
          onChange={(v) => onChange({ priceModel: (v || undefined) as DirectoryQuery["priceModel"] })}
        >
          <option value="">Any pricing model</option>
          {facets.priceModel.map((f) => (
            <option key={f.value} value={f.value}>
              {labelFor(pricingModelLabel, f.value)} ({f.count})
            </option>
          ))}
        </Select>
        <div className="mt-3 space-y-1">
          {locked?.freePlan === undefined && (
            <Check
              label="Free plan available"
              count={flagCounts.freePlan}
              checked={!!query.freePlan}
              onChange={(on) => onChange({ freePlan: on || undefined })}
            />
          )}
          {locked?.freeTrial === undefined && (
            <Check
              label="Free trial available"
              count={flagCounts.freeTrial}
              checked={!!query.freeTrial}
              onChange={(on) => onChange({ freeTrial: on || undefined })}
            />
          )}
        </div>
        <p className="type-meta mt-2 text-xs">
          Only free plans and trials we know about count; where we are unsure, a product is left
          out.
        </p>
      </Section>

      <Section title="Rating">
        {ratingsAvailable ? (
          <RadioGroup
            name={`${ids}-rating`}
            value={query.minRating === undefined ? "" : String(query.minRating)}
            options={[
              { value: "", label: "Any rating" },
              ...RATING_STEPS.map((r) => ({ value: String(r), label: `${r} stars and up` })),
            ]}
            onChange={(v) => onChange({ minRating: v ? Number(v) : undefined })}
          />
        ) : (
          <p className="type-meta">
            No products have ratings yet. Rating filters will appear once reviews open and
            verified ratings are collected.
          </p>
        )}
      </Section>

      {facets.companySize.length > 0 && (
        <Section title="Company size">
          <RadioGroup
            name={`${ids}-size`}
            value={query.companySize ?? ""}
            options={[
              { value: "", label: "Any size" },
              ...facets.companySize
                .slice()
                .sort((a, b) => order(companySizeLabel, a.value) - order(companySizeLabel, b.value))
                .map((f) => ({ value: f.value, label: labelFor(companySizeLabel, f.value), count: f.count })),
            ]}
            onChange={(v) => onChange({ companySize: v || undefined })}
          />
        </Section>
      )}

      {facets.deployment.length > 0 && (
        <Section title="Deployment">
          <RadioGroup
            name={`${ids}-deployment`}
            value={query.deployment ?? ""}
            options={[
              { value: "", label: "Any deployment" },
              ...facets.deployment
                .slice()
                .sort((a, b) => order(deploymentLabel, a.value) - order(deploymentLabel, b.value))
                .map((f) => ({ value: f.value, label: labelFor(deploymentLabel, f.value), count: f.count })),
            ]}
            onChange={(v) => onChange({ deployment: v || undefined })}
          />
        </Section>
      )}

      {(facets.industry.length > 0 || query.industry) && (
        <Section title="Industry">
          <Select
            id={`${ids}-industry`}
            label="Industry"
            value={query.industry ?? ""}
            onChange={(v) => onChange({ industry: v || undefined })}
          >
            <option value="">All industries</option>
            {facets.industry
              .slice()
              .sort((a, b) => (industryName.get(a.value) ?? a.value).localeCompare(industryName.get(b.value) ?? b.value))
              .map((f) => (
                <option key={f.value} value={f.value}>
                  {industryName.get(f.value) ?? "Unknown industry"} ({f.count})
                </option>
              ))}
          </Select>
        </Section>
      )}

      {(facets.feature.length > 0 || query.feature?.length) && (
        <Section title="Features">
          <CheckList
            values={facets.feature}
            selected={query.feature ?? []}
            labelOf={(v) => featureName.get(v) ?? "Unknown feature"}
            onChange={(feature) => onChange({ feature: feature.length ? feature : undefined })}
            noun="features"
          />
        </Section>
      )}

      {(facets.integration.length > 0 || query.integration?.length) && (
        <Section title="Integrations">
          <CheckList
            values={facets.integration}
            selected={query.integration ?? []}
            labelOf={(v) => integrationName.get(v) ?? "Unknown integration"}
            onChange={(integration) => onChange({ integration: integration.length ? integration : undefined })}
            noun="integrations"
          />
        </Section>
      )}
    </div>
  );
}

function order(map: Record<string, string>, value: string): number {
  const i = Object.keys(map).indexOf(value);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 py-5 first:pt-0 last:pb-0">
      <legend className="type-label float-left mb-3 w-full">{title}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}

/** Text filter; commits on submit so typing never fights the URL update. */
function KeywordSearch({ value, onSubmit }: { value: string; onSubmit: (q: string) => void }) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  // Follow the URL when the query changes elsewhere (header search, chips).
  if (value !== synced) {
    setSynced(value);
    setText(value);
  }
  const id = useId();
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit(text.trim());
  }
  return (
    <form role="search" onSubmit={submit} className="pb-5">
      <label htmlFor={id} className="type-label mb-3 block">
        Keyword
      </label>
      <div className="relative">
        <input
          id={id}
          type="search"
          value={text}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder="Name, vendor or feature"
          className="h-10 w-full rounded-md border border-line-strong bg-surface pr-18 pl-3 text-sm text-ink shadow-card placeholder:text-subtle [&::-webkit-search-cancel-button]:hidden"
        />
        {text && (
          <button
            type="button"
            aria-label="Clear keyword"
            onClick={() => {
              setText("");
              if (value) onSubmit("");
            }}
            className="absolute top-1/2 right-9 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-subtle hover:bg-surface-alt hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="absolute top-1/2 right-1.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-subtle hover:bg-surface-alt hover:text-ink"
        >
          <Search aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </div>
    </form>
  );
}

function Select({
  id,
  label,
  visibleLabel = false,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  visibleLabel?: boolean;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={visibleLabel ? "mb-1.5 block text-sm text-ink" : "sr-only"}>
        {label}
      </label>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none truncate rounded-md border border-line-strong bg-surface py-0 pr-9 pl-3 text-sm text-ink shadow-card hover:border-muted/60"
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          strokeWidth={2}
        />
      </span>
    </div>
  );
}

const optionRow =
  "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-sm px-1 text-sm text-ink hover:bg-surface-alt";

function Count({ value }: { value?: number }) {
  if (value === undefined) return null;
  return <span className="ml-auto pl-2 text-xs text-subtle tabular-nums">{value}</span>;
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={optionRow}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-navy"
      />
      <span className="min-w-0">{label}</span>
      <Count value={count} />
    </label>
  );
}

function RadioGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string; count?: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {options.map((o) => (
        <label key={o.value || "any"} className={optionRow}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="size-4 shrink-0 accent-navy"
          />
          <span className="min-w-0">{o.label}</span>
          <Count value={o.count} />
        </label>
      ))}
    </div>
  );
}

function CheckList({
  values,
  selected,
  labelOf,
  onChange,
  noun,
}: {
  values: FacetValue[];
  selected: string[];
  labelOf: (value: string) => string;
  onChange: (selected: string[]) => void;
  noun: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const preview = values.filter((v, i) => i < LIST_PREVIEW || selected.includes(v.value));
  const shown = expanded ? values : preview;
  const hidden = values.length - preview.length;

  return (
    <div>
      <div id={listId} className="space-y-0.5">
        {shown.map((f) => (
          <Check
            key={f.value}
            label={labelOf(f.value)}
            count={f.count}
            checked={selected.includes(f.value)}
            onChange={(on) =>
              onChange(on ? [...selected, f.value] : selected.filter((s) => s !== f.value))
            }
          />
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 rounded-xs px-1 text-sm font-medium text-blue-ink hover:text-navy"
        >
          {expanded ? `Show fewer ${noun}` : `Show all ${values.length} ${noun}`}
        </button>
      )}
    </div>
  );
}
