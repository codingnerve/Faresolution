/**
 * Directory query logic: parse URL params into a typed query, filter, sort,
 * paginate and count facets. Pure and client-safe (no data-layer imports), so
 * the /software listing can run it in the browser against a compact product
 * projection while the route itself stays a static server shell.
 *
 * Every parser is defensive: malformed or unknown values are ignored or
 * clamped, never thrown (Review Focus #2).
 */
import type { CompanySize, Deployment, PricingModel, Product } from "@/lib/data/types";
import { MAX_QUERY_LENGTH, search, type SearchIndex } from "@/lib/search";

export type DirectorySort = "relevance" | "name" | "newest" | "rating" | "trending";
export type DirectoryView = "grid" | "list";

export interface DirectoryQuery {
  q: string;
  category?: string;
  priceModel?: Product["pricing"]["model"];
  freePlan?: boolean;
  freeTrial?: boolean;
  minRating?: number;
  companySize?: string;
  deployment?: string;
  industry?: string;
  feature?: string[];
  integration?: string[];
  sort: DirectorySort;
  page: number;
  view: DirectoryView;
}

/** R5: facets with a value list and per-value counts. */
export type FacetKey =
  | "category"
  | "priceModel"
  | "companySize"
  | "deployment"
  | "industry"
  | "feature"
  | "integration";

export interface FacetValue {
  value: string;
  count: number;
}

export type FacetCounts = Record<FacetKey, FacetValue[]>;

/** The product fields the directory filters, sorts and renders on. `Product` satisfies it. */
export type DirectoryItem = Pick<
  Product,
  | "slug"
  | "name"
  | "categorySlugs"
  | "industrySlugs"
  | "featureSlugs"
  | "integrationSlugs"
  | "deployment"
  | "companySizes"
  | "rating"
  | "reviewCount"
  | "addedAt"
  | "trendingRank"
> & { pricing: Pick<Product["pricing"], "model" | "freePlan" | "freeTrial"> };

export interface DirectoryContext {
  /** Search index for the `q` filter (name, vendor, category, feature, industry). */
  searchIndex?: SearchIndex | null;
  /**
   * Child category slugs by parent slug (see `buildCategoryChildren`). With it,
   * a root category matches products tagged with any of its children (R10).
   */
  categoryChildren?: Readonly<Record<string, readonly string[]>>;
}

export const PAGE_SIZE = 12;
/** Upper bound for `page` so absurd values stay safe integers. */
export const MAX_PAGE = 10_000;
const MAX_LIST_VALUES = 20;

export const SORTS: readonly DirectorySort[] = ["relevance", "name", "newest", "rating", "trending"];
export const VIEWS: readonly DirectoryView[] = ["grid", "list"];
export const PRICING_MODELS: readonly PricingModel[] = [
  "free",
  "freemium",
  "subscription",
  "usage",
  "one-time",
  "custom",
];
export const COMPANY_SIZES: readonly CompanySize[] = ["solo", "small", "mid", "enterprise"];
export const DEPLOYMENTS: readonly Deployment[] = ["cloud", "on-premise", "hybrid"];

export const DEFAULT_QUERY: Readonly<DirectoryQuery> = Object.freeze({
  q: "",
  sort: "relevance",
  page: 1,
  view: "grid",
});

export type RawParams = Record<string, string | string[] | undefined>;

// --- Parsing ------------------------------------------------------------------

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 80;

function own(params: RawParams, key: string): string | string[] | undefined {
  return Object.prototype.hasOwnProperty.call(params, key) ? params[key] : undefined;
}

/** First value of a param (arrays collapse to their first entry). */
function first(params: RawParams, key: string): string | undefined {
  const value = own(params, key);
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : undefined;
}

function slug(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = value.trim();
  return v.length <= MAX_SLUG_LENGTH && SLUG.test(v) ? v : undefined;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  const v = value?.trim();
  return v !== undefined && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

function flag(value: string | undefined): true | undefined {
  const v = value?.trim().toLowerCase();
  return v === "true" || v === "1" ? true : undefined;
}

function pageNumber(value: string | undefined): number {
  const v = value?.trim() ?? "";
  if (!/^\d+$/.test(v)) return 1;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), MAX_PAGE);
}

function rating(value: string | undefined): number | undefined {
  const v = value?.trim() ?? "";
  if (!/^\d+(?:\.\d+)?$/.test(v)) return undefined;
  const n = Number(v);
  return n >= 1 && n <= 5 ? Math.round(n * 10) / 10 : undefined;
}

/** All values of a list param: repeated keys and comma separated values, deduplicated. */
function slugList(params: RawParams, key: string): string[] | undefined {
  const value = own(params, key);
  const raw = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const out: string[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    for (const part of entry.split(",")) {
      const s = slug(part);
      if (s && !out.includes(s)) out.push(s);
      if (out.length >= MAX_LIST_VALUES) break;
    }
  }
  return out.length > 0 ? out : undefined;
}

/** Drops keys whose value is `undefined`, so parsed queries compare cleanly. */
function compact(query: DirectoryQuery): DirectoryQuery {
  const out = { ...query } as Record<string, unknown>;
  for (const key of Object.keys(out)) if (out[key] === undefined) delete out[key];
  return out as unknown as DirectoryQuery;
}

/** Typed query from URL params. Never throws; invalid values fall back to defaults. */
export function parseQuery(params: RawParams): DirectoryQuery {
  const p = params ?? {};
  return compact({
    q: (first(p, "q") ?? "").trim().slice(0, MAX_QUERY_LENGTH).trim(),
    category: slug(first(p, "category")),
    priceModel: oneOf(first(p, "priceModel"), PRICING_MODELS),
    freePlan: flag(first(p, "freePlan")),
    freeTrial: flag(first(p, "freeTrial")),
    minRating: rating(first(p, "minRating")),
    companySize: oneOf(first(p, "companySize"), COMPANY_SIZES),
    deployment: oneOf(first(p, "deployment"), DEPLOYMENTS),
    industry: slug(first(p, "industry")),
    feature: slugList(p, "feature"),
    integration: slugList(p, "integration"),
    sort: oneOf(first(p, "sort"), SORTS) ?? "relevance",
    page: pageNumber(first(p, "page")),
    view: oneOf(first(p, "view"), VIEWS) ?? "grid",
  });
}

/** `URLSearchParams` (e.g. from `useSearchParams`) as a plain record for `parseQuery`. */
export function searchParamsToRecord(params: Pick<URLSearchParams, "keys" | "getAll">): RawParams {
  const record: RawParams = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    record[key] = values.length === 1 ? values[0] : values;
  }
  return record;
}

/**
 * Query string (without "?") for a query. Defaults (empty text, relevance,
 * page 1, grid) are omitted, so the unfiltered listing is the bare path.
 */
export function serializeQuery(query: DirectoryQuery): string {
  const out = new URLSearchParams();
  const q = query.q.trim();
  if (q) out.set("q", q);
  if (query.category) out.set("category", query.category);
  if (query.priceModel) out.set("priceModel", query.priceModel);
  if (query.freePlan) out.set("freePlan", "true");
  if (query.freeTrial) out.set("freeTrial", "true");
  if (query.minRating !== undefined) out.set("minRating", String(query.minRating));
  if (query.companySize) out.set("companySize", query.companySize);
  if (query.deployment) out.set("deployment", query.deployment);
  if (query.industry) out.set("industry", query.industry);
  for (const f of query.feature ?? []) out.append("feature", f);
  for (const i of query.integration ?? []) out.append("integration", i);
  if (query.sort !== "relevance") out.set("sort", query.sort);
  if (query.view !== "grid") out.set("view", query.view);
  if (query.page > 1) out.set("page", String(query.page));
  return out.toString();
}

// --- Filtering ----------------------------------------------------------------

/** Child slugs by parent slug, from any list of `{ slug, parentSlug }`. Plain JSON. */
export function buildCategoryChildren(
  categories: readonly { slug: string; parentSlug: string | null }[],
): Record<string, string[]> {
  const children: Record<string, string[]> = {};
  for (const c of categories) {
    if (c.parentSlug === null) continue;
    if (!Object.prototype.hasOwnProperty.call(children, c.parentSlug)) children[c.parentSlug] = [];
    children[c.parentSlug].push(c.slug);
  }
  return children;
}

function categorySet(category: string, ctx: DirectoryContext): Set<string> {
  const map = ctx.categoryChildren;
  const kids = map && Object.prototype.hasOwnProperty.call(map, category) ? map[category] : [];
  return new Set([category, ...kids]);
}

/** True when the text has something searchable (a letter or digit). */
function hasSearchText(text: string): boolean {
  return /[\p{L}\p{N}]/u.test(text);
}

/**
 * Search rank by slug for the text query (0 = best), or `null` when there is no
 * searchable text. Without an index, falls back to a case-insensitive name match.
 */
function textRanks<T extends DirectoryItem>(
  items: readonly T[],
  text: string,
  ctx: DirectoryContext,
): Map<string, number> | null {
  if (!hasSearchText(text)) return null;
  if (ctx.searchIndex) {
    const hits = search(ctx.searchIndex, text, { limit: Number.MAX_SAFE_INTEGER }).products;
    return new Map(hits.map((h, i) => [h.slug, i]));
  }
  const needle = text.toLocaleLowerCase("en");
  return new Map(
    items.filter((p) => p.name.toLocaleLowerCase("en").includes(needle)).map((p, i) => [p.slug, i]),
  );
}

type Predicate = (p: DirectoryItem) => boolean;

/** One predicate per active filter, keyed so facet counts can leave one out. */
function predicates(query: DirectoryQuery, ctx: DirectoryContext): Partial<Record<string, Predicate>> {
  const preds: Partial<Record<string, Predicate>> = {};
  if (query.category) {
    const set = categorySet(query.category, ctx);
    preds.category = (p) => p.categorySlugs.some((s) => set.has(s));
  }
  if (query.priceModel) preds.priceModel = (p) => p.pricing.model === query.priceModel;
  if (query.freePlan) preds.freePlan = (p) => p.pricing.freePlan === true;
  if (query.freeTrial) preds.freeTrial = (p) => p.pricing.freeTrial === true;
  if (query.minRating !== undefined) {
    const min = query.minRating;
    preds.minRating = (p) => p.rating !== null && Number.isFinite(p.rating) && p.rating >= min;
  }
  if (query.companySize) {
    const size = query.companySize;
    preds.companySize = (p) => (p.companySizes as string[]).includes(size);
  }
  if (query.deployment) {
    const dep = query.deployment;
    preds.deployment = (p) => (p.deployment as string[]).includes(dep);
  }
  if (query.industry) {
    const ind = query.industry;
    preds.industry = (p) => p.industrySlugs.includes(ind);
  }
  if (query.feature?.length) {
    const wanted = query.feature;
    preds.feature = (p) => wanted.every((f) => p.featureSlugs.includes(f));
  }
  if (query.integration?.length) {
    const wanted = query.integration;
    preds.integration = (p) => wanted.every((i) => p.integrationSlugs.includes(i));
  }
  return preds;
}

function filterItems<T extends DirectoryItem>(
  items: readonly T[],
  ranks: Map<string, number> | null,
  preds: Partial<Record<string, Predicate>>,
  skip?: string,
): T[] {
  const active = Object.entries(preds)
    .filter(([key]) => key !== skip)
    .map(([, pred]) => pred as Predicate);
  return items.filter((p) => (ranks === null || ranks.has(p.slug)) && active.every((pred) => pred(p)));
}

// --- Sorting ------------------------------------------------------------------

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
const byName = (a: DirectoryItem, b: DirectoryItem) => collator.compare(a.name, b.name);

function validRating(p: DirectoryItem): number | null {
  return p.rating !== null && Number.isFinite(p.rating) && p.rating > 0 ? p.rating : null;
}

/** Ascending with nulls last. */
function nullsLast(a: number | null, b: number | null): number {
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  return a - b;
}

function sortItems<T extends DirectoryItem>(items: T[], sort: DirectorySort, ranks: Map<string, number> | null): T[] {
  switch (sort) {
    case "name":
      return items.sort(byName);
    case "newest":
      return items.sort((a, b) => (a.addedAt < b.addedAt ? 1 : a.addedAt > b.addedAt ? -1 : byName(a, b)));
    case "rating":
      return items.sort((a, b) => {
        const ra = validRating(a);
        const rb = validRating(b);
        return nullsLast(ra === null ? null : -ra, rb === null ? null : -rb) || b.reviewCount - a.reviewCount || byName(a, b);
      });
    case "trending":
      return items.sort((a, b) => nullsLast(a.trendingRank, b.trendingRank) || byName(a, b));
    case "relevance":
    default:
      if (ranks) return items.sort((a, b) => (ranks.get(a.slug) ?? 0) - (ranks.get(b.slug) ?? 0));
      return items.sort(byName);
  }
}

/** Filtered and sorted products (a new array; the input is not modified). */
export function applyQuery<T extends DirectoryItem>(
  products: readonly T[],
  query: DirectoryQuery,
  ctx: DirectoryContext = {},
): T[] {
  const ranks = textRanks(products, query.q, ctx);
  const result = filterItems(products, ranks, predicates(query, ctx));
  return sortItems(result, query.sort, ranks);
}

// --- Pagination ---------------------------------------------------------------

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

/** One page of items. Out-of-range or invalid pages clamp to the first/last page. */
export function paginate<T>(items: readonly T[], page: number, pageSize = PAGE_SIZE): Page<T> {
  const size = Number.isFinite(pageSize) && pageSize >= 1 ? Math.floor(pageSize) : PAGE_SIZE;
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const requested = Number.isFinite(page) ? Math.floor(page) : 1;
  const current = Math.min(Math.max(1, requested), pageCount);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), page: current, pageCount, total };
}

// --- Facets -------------------------------------------------------------------

function tally(counts: Map<string, number>, values: Iterable<string>) {
  for (const v of new Set(values)) counts.set(v, (counts.get(v) ?? 0) + 1);
}

function toList(counts: Map<string, number>, selected: readonly (string | undefined | null)[]): FacetValue[] {
  for (const s of selected) if (s && !counts.has(s)) counts.set(s, 0);
  return [...counts.entries()]
    .filter(([value, count]) => count > 0 || selected.includes(value))
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || (a.value < b.value ? -1 : a.value > b.value ? 1 : 0));
}

/**
 * Counts per facet value. Single-valued facets (category, price model, company
 * size, deployment, industry) count against every other active filter, so a
 * count is the result size after switching to that value. Multi-valued facets
 * (feature, integration) combine with AND, so a count is the result size after
 * adding that value. Zero counts are dropped except for a selected value.
 */
export function facetCounts<T extends DirectoryItem>(
  products: readonly T[],
  query: DirectoryQuery,
  ctx: DirectoryContext = {},
): FacetCounts {
  const ranks = textRanks(products, query.q, ctx);
  const preds = predicates(query, ctx);
  const without = (key: FacetKey) => filterItems(products, ranks, preds, key);
  const all = filterItems(products, ranks, preds);

  // Category: a product counts towards each category it is tagged with and
  // towards that category's parent (tree union, each product once).
  const parentOf = new Map<string, string>();
  for (const [parent, kids] of Object.entries(ctx.categoryChildren ?? {})) {
    for (const kid of kids) parentOf.set(kid, parent);
  }
  const category = new Map<string, number>();
  for (const p of without("category")) {
    const tags = p.categorySlugs.flatMap((s) => {
      const parent = parentOf.get(s);
      return parent ? [s, parent] : [s];
    });
    tally(category, tags);
  }

  const priceModel = new Map<string, number>();
  for (const p of without("priceModel")) if (p.pricing.model) tally(priceModel, [p.pricing.model]);

  const companySize = new Map<string, number>();
  for (const p of without("companySize")) tally(companySize, p.companySizes);

  const deployment = new Map<string, number>();
  for (const p of without("deployment")) tally(deployment, p.deployment);

  const industry = new Map<string, number>();
  for (const p of without("industry")) tally(industry, p.industrySlugs);

  const feature = new Map<string, number>();
  for (const p of all) tally(feature, p.featureSlugs);

  const integration = new Map<string, number>();
  for (const p of all) tally(integration, p.integrationSlugs);

  return {
    category: toList(category, [query.category]),
    priceModel: toList(priceModel, [query.priceModel]),
    companySize: toList(companySize, [query.companySize]),
    deployment: toList(deployment, [query.deployment]),
    industry: toList(industry, [query.industry]),
    feature: toList(feature, query.feature ?? []),
    integration: toList(integration, query.integration ?? []),
  };
}

/** Number of active filters (text query included; sort, view and page excluded). */
export function activeFilterCount(query: DirectoryQuery): number {
  return (
    (query.q ? 1 : 0) +
    [query.category, query.priceModel, query.freePlan, query.freeTrial, query.minRating, query.companySize, query.deployment, query.industry].filter(
      (v) => v !== undefined,
    ).length +
    (query.feature?.length ?? 0) +
    (query.integration?.length ?? 0)
  );
}
