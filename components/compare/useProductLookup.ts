"use client";

import { useMemo } from "react";
import { useSearchIndex } from "@/components/layout/SearchIndexProvider";
import type { IndexedProduct } from "@/lib/search";

/**
 * Name, vendor and brand colour by slug, from the search index the root
 * layout already ships, so client compare UI needs no extra product data.
 */
export function useProductLookup(): ReadonlyMap<string, IndexedProduct> {
  const index = useSearchIndex();
  return useMemo(() => new Map((index?.products ?? []).map((p) => [p.slug, p])), [index]);
}
