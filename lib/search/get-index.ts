/**
 * Server-side assembly of the search index from the static catalogue. Built
 * once per server process. The root layout passes it to SearchIndexProvider,
 * so every SearchBox (header, 404 page, homepage hero) reads the same copy.
 */
import {
  getCategories,
  getFeatures,
  getIndustries,
  getProducts,
  getVendors,
} from "@/lib/data";
import { buildSearchIndex, type SearchIndex } from "./index";

let cached: Promise<SearchIndex> | null = null;

export function getSearchIndex(): Promise<SearchIndex> {
  cached ??= Promise.all([
    getProducts(),
    getCategories(),
    getVendors(),
    getFeatures(),
    getIndustries(),
  ]).then(([products, categories, vendors, features, industries]) =>
    buildSearchIndex({ products, categories, vendors, features, industries }),
  );
  return cached;
}
