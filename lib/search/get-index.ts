/**
 * Server-side assembly of the search index from the static catalogue. Built
 * once per server process and shared by the root layout (header search), the
 * 404 page and any other page that embeds a SearchBox.
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
