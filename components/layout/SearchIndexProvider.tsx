"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SearchIndex } from "@/lib/search";

const SearchIndexContext = createContext<SearchIndex | null>(null);

/**
 * Makes the search index (built once on the server in the root layout)
 * available to every SearchBox on the page, so the index is serialised into
 * the payload once, with the layout, instead of once per search field.
 */
export function SearchIndexProvider({ index, children }: { index: SearchIndex; children: ReactNode }) {
  return <SearchIndexContext.Provider value={index}>{children}</SearchIndexContext.Provider>;
}

/** The shared search index, or `null` outside `SearchIndexProvider`. */
export function useSearchIndex(): SearchIndex | null {
  return useContext(SearchIndexContext);
}
