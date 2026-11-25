"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type RefObject } from "react";
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

export type ChipFocusTarget = number | "clear-all" | "fallback";

/**
 * Where focus goes after the chip at `removedIndex` is removed and
 * `remaining` chips are left: the chip that moved into its place, else
 * "Clear all", else the fallback (the results), never `<body>`.
 */
export function chipFocusTarget(removedIndex: number, remaining: number): ChipFocusTarget {
  if (remaining <= 0) return "fallback";
  return removedIndex < remaining ? removedIndex : "clear-all";
}

/** Active filter chips with per-chip remove and "Clear all". Renders nothing without filters. */
export function ActiveFilters({
  chips,
  onRemove,
  onClearAll,
  fallbackFocusRef,
  headingLevel = 2,
}: {
  chips: Chip[];
  onRemove: (patch: QueryPatch) => void;
  onClearAll: () => void;
  /** Focused when the last chip is removed or everything is cleared. */
  fallbackFocusRef: RefObject<HTMLElement | null>;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as const;
  const listRef = useRef<HTMLUListElement>(null);
  const clearRef = useRef<HTMLButtonElement>(null);
  // Set on click; applied once the URL update has re-rendered the chips.
  const pending = useRef<{ index: number; before: string } | null>(null);
  const signature = chips.map((c) => c.key).join("|");

  useEffect(() => {
    const p = pending.current;
    if (!p || p.before === signature) return;
    pending.current = null;
    const target = chipFocusTarget(p.index, chips.length);
    if (target === "fallback") fallbackFocusRef.current?.focus({ preventScroll: true });
    else if (target === "clear-all") clearRef.current?.focus();
    else listRef.current?.querySelectorAll<HTMLButtonElement>("button")[target]?.focus();
  }, [signature, chips.length, fallbackFocusRef]);

  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Heading className="sr-only">Active filters</Heading>
      <ul ref={listRef} className="flex flex-wrap items-center gap-2">
        {chips.map((chip, index) => (
          <li key={chip.key} className="max-w-full">
            <button
              type="button"
              onClick={() => {
                pending.current = { index, before: signature };
                onRemove(chip.remove);
              }}
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
        ref={clearRef}
        type="button"
        onClick={() => {
          // Every chip goes, so focus lands on the fallback.
          pending.current = { index: chips.length, before: signature };
          onClearAll();
        }}
        className="ml-1 rounded-xs text-[0.8125rem] font-medium text-subtle underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink"
      >
        Clear all
      </button>
    </div>
  );
}
