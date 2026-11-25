/**
 * Rows of the side-by-side comparison table. Every cell is display text built
 * from known facts only: an unknown fact reads "Not verified", a rating that is
 * not backed by reviews reads "Not rated yet", and no cell ever contains
 * "null", "NaN" or "undefined". `differs` is true only when the cells of a row
 * are not all the same text.
 */
import { companySizeLabel, deploymentLabel, labelFor, platformLabel, pricingModelLabel } from "@/lib/directory/labels";
import type { Feature, Product } from "@/lib/data/types";

export type CompareSection = "overview" | "pricing" | "product" | "ratings" | "features";

export interface CompareRow {
  key: string;
  label: string;
  cells: string[];
  differs: boolean;
  section: CompareSection;
}

export const COMPARE_SECTION_LABEL: Record<CompareSection, string> = {
  overview: "Overview",
  pricing: "Pricing",
  product: "Product and platform",
  ratings: "Ratings by area",
  features: "Features",
};

export interface CompareLookups {
  /** Feature names by slug; unknown slugs fall back to a readable form of the slug. */
  featureName?: ReadonlyMap<string, string>;
  integrationName?: ReadonlyMap<string, string>;
}

export const NOT_VERIFIED = "Not verified";
export const NOT_RATED = "Not rated yet";
export const NO_REVIEWS = "No reviews yet";

/** How many names a list cell shows before "and N more". */
const LIST_LIMIT = 4;

function humanize(slug: string): string {
  const text = slug.replace(/-/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : slug;
}

function nameList(slugs: readonly string[], names: ReadonlyMap<string, string> | undefined): string {
  if (slugs.length === 0) return NOT_VERIFIED;
  const labels = slugs.map((slug) => names?.get(slug) ?? humanize(slug));
  const shown = labels.slice(0, LIST_LIMIT).join(", ");
  const rest = labels.length - LIST_LIMIT;
  return rest > 0 ? `${shown} and ${rest} more` : shown;
}

function labelList<K extends string>(map: Record<K, string>, values: readonly string[]): string {
  return values.length > 0 ? values.map((value) => labelFor(map, value)).join(", ") : NOT_VERIFIED;
}

function yesNo(value: boolean | null): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return NOT_VERIFIED;
}

function hasReviews(product: Product): boolean {
  return Number.isFinite(product.reviewCount) && product.reviewCount > 0;
}

function ratingText(product: Product): string {
  const { rating } = product;
  if (rating === null || !Number.isFinite(rating) || rating <= 0 || !hasReviews(product)) return NOT_RATED;
  return `${rating.toFixed(1)} out of 5`;
}

function reviewCountText(product: Product): string {
  if (!hasReviews(product)) return NO_REVIEWS;
  const n = Math.floor(product.reviewCount);
  return `${n.toLocaleString("en-US")} ${n === 1 ? "review" : "reviews"}`;
}

function row(key: string, label: string, section: CompareSection, cells: string[]): CompareRow {
  return { key, label, section, cells, differs: cells.some((cell) => cell !== cells[0]) };
}

/** The fact rows of the comparison, one cell per product in the given order. */
export function buildRows(products: readonly Product[], lookups: CompareLookups = {}): CompareRow[] {
  const cells = (fn: (p: Product) => string) => products.map(fn);
  return [
    row("overview", "Overview", "overview", cells((p) => p.tagline.trim() || NOT_VERIFIED)),
    row("rating", "Overall rating", "overview", cells(ratingText)),
    row("reviewCount", "Reviews", "overview", cells(reviewCountText)),
    row("pricingModel", "Pricing model", "pricing", cells((p) => (p.pricing.model ? labelFor(pricingModelLabel, p.pricing.model) : NOT_VERIFIED))),
    row("startingPrice", "Starting price", "pricing", cells((p) => p.pricing.startingPrice?.trim() || NOT_VERIFIED)),
    row("freePlan", "Free plan", "pricing", cells((p) => yesNo(p.pricing.freePlan))),
    row("freeTrial", "Free trial", "pricing", cells((p) => yesNo(p.pricing.freeTrial))),
    row("keyFeatures", "Key features", "product", cells((p) => nameList(p.featureSlugs, lookups.featureName))),
    row("deployment", "Deployment", "product", cells((p) => labelList(deploymentLabel, p.deployment))),
    row("platforms", "Platforms", "product", cells((p) => labelList(platformLabel, p.platforms))),
    row("companySize", "Company size", "product", cells((p) => labelList(companySizeLabel, p.companySizes))),
    row("integrations", "Integrations", "product", cells((p) => nameList(p.integrationSlugs, lookups.integrationName))),
    // No area ratings exist until reviews are collected.
    row("support", "Customer support", "ratings", cells(() => NOT_RATED)),
    row("easeOfUse", "Ease of use", "ratings", cells(() => NOT_RATED)),
    row("valueForMoney", "Value for money", "ratings", cells(() => NOT_RATED)),
  ];
}

/**
 * One row per feature listed by any of the products, in taxonomy order. A cell
 * reads "Listed" or "Not listed": the catalogue is unverified sample data, so
 * a missing tag does not prove the product lacks the feature.
 */
export function buildFeatureRows(products: readonly Product[], features: readonly Feature[]): CompareRow[] {
  const listed = products.map((p) => new Set(p.featureSlugs));
  return features
    .filter((feature) => listed.some((set) => set.has(feature.slug)))
    .map((feature) =>
      row(
        `feature:${feature.slug}`,
        feature.name,
        "features",
        listed.map((set) => (set.has(feature.slug) ? "Listed" : "Not listed")),
      ),
    );
}
