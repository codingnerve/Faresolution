"use client";

import { X } from "lucide-react";
import type { DirectoryLabels } from "@/lib/directory/data";
import { companySizeLabel, deploymentLabel, labelFor, pricingModelLabel } from "@/lib/directory/labels";
import type { DirectoryQuery } from "@/lib/directory/query";
import type { QueryPatch } from "./FilterPanel";

export interface Chip {
  key: string;
  label: string;
  remove: QueryPatch;
}

/** One removable chip per active filter, in panel order. Locked route values are not included. */
export function activeChips(query: DirectoryQuery, labels: DirectoryLabels, lockedKeys: string[] = []): Chip[] {
  const name = (list: { slug: string; name: string }[], slug: string, fallback: string) =>
    list.find((x) => x.slug === slug)?.name ?? fallback;
  const chips: Chip[] = [];
  if (query.q) chips.push({ key: "q", label: `Keyword: “${query.q}”`, remove: { q: "" } });
  if (query.category) {
    chips.push({
      key: "category",
      label: name(labels.categories, query.category, "Unknown category"),
      remove: { category: undefined },
    });
  }
  if (query.priceModel) {
    chips.push({ key: "priceModel", label: labelFor(pricingModelLabel, query.priceModel), remove: { priceModel: undefined } });
  }
  if (query.freePlan && !lockedKeys.includes("freePlan")) {
    chips.push({ key: "freePlan", label: "Free plan", remove: { freePlan: undefined } });
  }
  if (query.freeTrial && !lockedKeys.includes("freeTrial")) {
    chips.push({ key: "freeTrial", label: "Free trial", remove: { freeTrial: undefined } });
  }
  if (query.minRating !== undefined) {
    chips.push({ key: "minRating", label: `${query.minRating} stars and up`, remove: { minRating: undefined } });
  }
  if (query.companySize) {
    chips.push({ key: "companySize", label: labelFor(companySizeLabel, query.companySize), remove: { companySize: undefined } });
  }
  if (query.deployment) {
    chips.push({ key: "deployment", label: labelFor(deploymentLabel, query.deployment), remove: { deployment: undefined } });
  }
  if (query.industry) {
    chips.push({
      key: "industry",
      label: name(labels.industries, query.industry, "Unknown industry"),
      remove: { industry: undefined },
    });
  }
  for (const f of query.feature ?? []) {
    const rest = query.feature!.filter((x) => x !== f);
    chips.push({
      key: `feature-${f}`,
      label: name(labels.features, f, "Unknown feature"),
      remove: { feature: rest.length ? rest : undefined },
    });
  }
  for (const i of query.integration ?? []) {
    const rest = query.integration!.filter((x) => x !== i);
    chips.push({
      key: `integration-${i}`,
      label: `Works with ${name(labels.integrations, i, "unknown integration")}`,
      remove: { integration: rest.length ? rest : undefined },
    });
  }
  return chips;
}

/** Active filter chips with per-chip remove and "Clear all". Renders nothing without filters. */
export function ActiveFilters({
  chips,
  onRemove,
  onClearAll,
}: {
  chips: Chip[];
  onRemove: (patch: QueryPatch) => void;
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="sr-only">Active filters</h2>
      <ul className="contents">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={() => onRemove(chip.remove)}
              aria-label={`Remove filter: ${chip.label}`}
              className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-md border border-blue/20 bg-blue-tint pr-2 pl-3 text-[0.8125rem] font-medium text-blue-ink hover:border-blue/40"
            >
              <span className="truncate">{chip.label}</span>
              <X aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={2.25} />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 rounded-xs text-[0.8125rem] font-medium text-subtle underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink"
      >
        Clear all
      </button>
    </div>
  );
}
