/**
 * Client-safe search over products, categories and vendors.
 *
 * `buildSearchIndex` (server side) produces a compact, plain-JSON `SearchIndex`
 * that can be passed from a server component to a client component; `search`
 * runs against it in the browser. No part of a query ever reaches a RegExp: all
 * matching is done with string operations on a normalised copy of the input.
 */
import type { Category, Feature, Industry, Product, Vendor, VendorLogo } from "@/lib/data/types";
import { levenshtein } from "./distance";

export const MAX_QUERY_LENGTH = 100;
const MAX_TOKENS = 8;
const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 200;

/** Static suggestions; each resolves to results in the sample catalogue. */
export const suggestedSearches: string[] = [
  "CRM",
  "Project management",
  "Accounting",
  "Payroll",
  "Email marketing",
  "Help desk",
  "HR software",
  "Analytics",
];

// --- Index types (plain JSON) -------------------------------------------------

export interface IndexedProduct {
  slug: string;
  name: string;
  vendorName: string;
  tagline: string;
  categoryName: string;
  categorySlug: string;
  brandColor: string;
  logo?: VendorLogo | null;
  /** Normalised category, industry and feature names mapped to this product. */
  terms: string[];
}

export interface IndexedCategory {
  slug: string;
  name: string;
  productCount: number;
}

export interface IndexedVendor {
  slug: string;
  name: string;
  productCount: number;
}

export interface SearchIndex {
  products: IndexedProduct[];
  categories: IndexedCategory[];
  vendors: IndexedVendor[];
}

export interface BuildInput {
  products: Product[];
  categories: Category[];
  vendors: Vendor[];
  /** Required: feature names are searchable (pass `[]` only if there are none). */
  features: Feature[];
  /** Required: industry names are searchable (pass `[]` only if there are none). */
  industries: Industry[];
}

export interface ProductHit {
  slug: string;
  name: string;
  vendorName: string;
  tagline: string;
  primaryCategoryName: string;
  brandColor: string;
  logo?: VendorLogo | null;
}

export interface CategoryHit {
  slug: string;
  name: string;
  productCount: number;
}

export interface VendorHit {
  slug: string;
  name: string;
  productCount: number;
}

export interface SearchResults {
  products: ProductHit[];
  categories: CategoryHit[];
  vendors: VendorHit[];
}

// --- Normalisation ------------------------------------------------------------

/** Lowercase, strip diacritics, turn every non letter/digit run into one space. */
function normalize(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function queryTokens(query: unknown): string[] {
  if (typeof query !== "string") return [];
  const tokens = normalize(query.slice(0, MAX_QUERY_LENGTH)).split(" ").filter(Boolean);
  return [...new Set(tokens)].slice(0, MAX_TOKENS);
}

// --- Build --------------------------------------------------------------------

function uniqueBy<T extends { slug: string }>(items: readonly T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) if (!seen.has(item.slug)) seen.set(item.slug, item);
  return [...seen.values()];
}

export function buildSearchIndex(input: BuildInput): SearchIndex {
  const products = uniqueBy(input.products);
  const categories = uniqueBy(input.categories);
  const vendors = uniqueBy(input.vendors);

  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const vendorBySlug = new Map(vendors.map((v) => [v.slug, v]));
  const industryName = new Map(input.industries.map((i) => [i.slug, i.name]));
  const featureName = new Map(input.features.map((f) => [f.slug, f.name]));

  const categoryCount = new Map<string, number>();
  const vendorCount = new Map<string, number>();
  for (const p of products) {
    for (const slug of new Set(p.categorySlugs)) {
      categoryCount.set(slug, (categoryCount.get(slug) ?? 0) + 1);
    }
    vendorCount.set(p.vendorSlug, (vendorCount.get(p.vendorSlug) ?? 0) + 1);
  }

  return {
    products: products.map((p) => {
      const names: (string | undefined)[] = [
        ...p.categorySlugs.map((s) => categoryName.get(s)),
        ...p.industrySlugs.map((s) => industryName.get(s)),
        ...p.featureSlugs.map((s) => featureName.get(s)),
      ];
      const terms = [
        ...new Set(
          names
            .filter((n): n is string => !!n)
            .map(normalize)
            .filter((n) => n.length > 0),
        ),
      ];
      const vendor = vendorBySlug.get(p.vendorSlug);
      const logo = p.logo ?? vendor?.logo ?? null;
      return {
        slug: p.slug,
        name: p.name,
        vendorName: vendor?.name ?? "",
        tagline: p.tagline,
        categoryName: categoryName.get(p.primaryCategory) ?? p.primaryCategory,
        categorySlug: p.primaryCategory,
        brandColor: p.brandColor,
        ...(logo ? { logo } : {}),
        terms,
      };
    }),
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      productCount: categoryCount.get(c.slug) ?? 0,
    })),
    vendors: vendors.map((v) => ({
      slug: v.slug,
      name: v.name,
      productCount: vendorCount.get(v.slug) ?? 0,
    })),
  };
}

// --- Scoring ------------------------------------------------------------------

interface Tiers {
  /** Whole field equals the token. */
  exact: number;
  /** Field starts with the token. */
  prefix: number;
  /** Some word in the field starts with the token. */
  word: number;
  /** Token occurs inside the field. */
  substring: number;
  /** Base score for a typo match (reduced by 5 per edit). */
  fuzzy: number;
  /** Tokens shorter than this never match this field. */
  minToken: number;
}

const NAME_TIERS: Tiers = { exact: 1000, prefix: 900, word: 800, substring: 600, fuzzy: 60, minToken: 1 };
const VENDOR_TIERS: Tiers = { exact: 500, prefix: 450, word: 400, substring: 300, fuzzy: 40, minToken: 1 };
const TERM_TIERS: Tiers = { exact: 300, prefix: 250, word: 220, substring: 200, fuzzy: 30, minToken: 1 };
// Taglines match on word starts only, and never for 1-2 letter tokens.
const TAGLINE_TIERS: Tiers = { exact: 0, prefix: 100, word: 100, substring: 0, fuzzy: 0, minToken: 3 };

/** Shortest token allowed to match inside a word (below this it is noise). */
const MIN_SUBSTRING_TOKEN = 3;

/** Largest edit distance tolerated for a token, or -1 when typos are not allowed. */
function maxDistance(token: string): number {
  if (token.length < 4) return -1;
  return token.length <= 6 ? 1 : 2;
}

interface Field {
  text: string;
  words: string[];
}

function field(raw: string): Field {
  const text = normalize(raw);
  return { text, words: text === "" ? [] : text.split(" ") };
}

/** Score of one token against one field (0 = no match). */
function scoreToken(f: Field, token: string, tiers: Tiers): number {
  if (f.text === "" || token.length < tiers.minToken) return 0;
  if (f.text === token) return tiers.exact;
  // A 1-2 letter token says nothing about position, so a name start is no
  // better than a word start (otherwise "cr" favours CrowdStrike over Zoho CRM).
  if (f.text.startsWith(token)) {
    return token.length < MIN_SUBSTRING_TOKEN ? tiers.word : tiers.prefix;
  }
  if (f.words.some((w) => w.startsWith(token))) return tiers.word;
  if (token.length >= MIN_SUBSTRING_TOKEN && f.text.includes(token)) return tiers.substring;

  const limit = maxDistance(token);
  if (limit < 0 || tiers.fuzzy <= 0) return 0;
  let best = limit + 1;
  for (const w of f.words) {
    if (Math.abs(w.length - token.length) <= limit) {
      best = Math.min(best, levenshtein(token, w));
    }
    // Also allow a typo within the typed prefix of a longer word.
    if (w.length > token.length) {
      best = Math.min(best, levenshtein(token, w.slice(0, token.length)));
    }
  }
  return best <= limit ? tiers.fuzzy - best * 5 : 0;
}

interface PreparedProduct {
  name: Field;
  vendor: Field;
  tagline: Field;
  terms: Field[];
}

interface Prepared {
  products: PreparedProduct[];
  categories: Field[];
  vendors: Field[];
}

// Normalised copies are derived once per index object (a deserialised index is
// a new object, so the cache never goes stale).
const preparedCache = new WeakMap<SearchIndex, Prepared>();

function prepare(index: SearchIndex): Prepared {
  let p = preparedCache.get(index);
  if (!p) {
    p = {
      products: index.products.map((x) => ({
        name: field(x.name),
        vendor: field(x.vendorName),
        tagline: field(x.tagline),
        terms: x.terms.map(field),
      })),
      categories: index.categories.map((x) => field(x.name)),
      vendors: index.vendors.map((x) => field(x.name)),
    };
    preparedCache.set(index, p);
  }
  return p;
}

/** Sum of per-token best scores; 0 if any token matches nothing. */
function scoreAll(tokens: string[], scoreOne: (token: string) => number): number {
  let total = 0;
  for (const t of tokens) {
    const s = scoreOne(t);
    if (s <= 0) return 0;
    total += s;
  }
  return total;
}

interface Scored<T> {
  item: T;
  score: number;
}

function rank<T extends { name: string }>(scored: Scored<T>[], limit: number): T[] {
  return scored
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.item.name.length - b.item.name.length ||
        (a.item.name < b.item.name ? -1 : a.item.name > b.item.name ? 1 : 0),
    )
    .slice(0, limit)
    .map((s) => s.item);
}

function sanitizeLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit) || limit < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(limit), MAX_LIMIT);
}

// --- Search -------------------------------------------------------------------

export function search(
  index: SearchIndex,
  query: string,
  opts?: { limit?: number },
): SearchResults {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return { products: [], categories: [], vendors: [] };

  const limit = sanitizeLimit(opts?.limit);
  const prepared = prepare(index);
  const phrase = tokens.join(" ");

  const products = rank(
    index.products.map((item, i): Scored<IndexedProduct> => {
      const p = prepared.products[i];
      let score = scoreAll(tokens, (t) =>
        Math.max(
          scoreToken(p.name, t, NAME_TIERS),
          scoreToken(p.vendor, t, VENDOR_TIERS),
          ...p.terms.map((term) => scoreToken(term, t, TERM_TIERS)),
          scoreToken(p.tagline, t, TAGLINE_TIERS),
        ),
      );
      if (score > 0 && tokens.length > 1 && p.name.text === phrase) score += 500;
      return { item, score };
    }),
    limit,
  ).map(
    (p): ProductHit => ({
      slug: p.slug,
      name: p.name,
      vendorName: p.vendorName,
      tagline: p.tagline,
      primaryCategoryName: p.categoryName,
      brandColor: p.brandColor,
      ...(p.logo ? { logo: p.logo } : {}),
    }),
  );

  const categories = rank(
    index.categories.map(
      (item, i): Scored<IndexedCategory> => ({
        item,
        score: scoreAll(tokens, (t) => scoreToken(prepared.categories[i], t, NAME_TIERS)),
      }),
    ),
    limit,
  ).map((c): CategoryHit => ({ slug: c.slug, name: c.name, productCount: c.productCount }));

  const vendors = rank(
    index.vendors.map(
      (item, i): Scored<IndexedVendor> => ({
        item,
        score: scoreAll(tokens, (t) => scoreToken(prepared.vendors[i], t, NAME_TIERS)),
      }),
    ),
    limit,
  ).map((v): VendorHit => ({ slug: v.slug, name: v.name, productCount: v.productCount }));

  return { products, categories, vendors };
}
