/**
 * The alternatives engine: which products are worth showing next to a given
 * product. Every "similar products" / "alternatives" list on the site (profile
 * overview, the profile's Alternatives tab, /alternatives/[product] and the
 * compare page's related products) goes through `getAlternatives`, so they all
 * agree.
 *
 * Similarity is scored from catalogue facts only: shared categories (the same
 * primary category weighs most), shared features, pricing model, industries
 * and deployment. It never uses ratings, reviews, popularity or editorial
 * ordering, and a fact we do not know (`null`) adds nothing and costs nothing.
 *
 * Relevance gate: a product is only returned when it shares a category with
 * the source or at least `MIN_SHARED_DISTINCTIVE_FEATURES` distinctive
 * features. A feature is distinctive when few products have it (see
 * `distinctiveLimit`): near-universal ones such as API access say nothing about
 * whether two products do the same job. Pricing model, free plan, industry and
 * deployment only rank products that already pass; two unrelated tools that
 * both happen to be cloud-based are not alternatives.
 */
import type { Deployment, Product } from "@/lib/data/types";
import { deploymentLabel, pricingModelLabel } from "@/lib/directory/labels";

export const DEFAULT_ALTERNATIVES_LIMIT = 8;

/** Shared distinctive features needed on their own (no shared category) to count as an alternative. */
export const MIN_SHARED_DISTINCTIVE_FEATURES = 3;

/** A feature is distinctive when at most this share of all products have it. */
export const DISTINCTIVE_FEATURE_SHARE = 0.2;

/**
 * Most products that may have a feature for it to count as distinctive: 20% of
 * the catalogue, but never fewer than two, so a feature that exactly two
 * products share still counts in a tiny catalogue.
 */
export function distinctiveLimit(productCount: number): number {
  return Math.max(2, Math.floor(productCount * DISTINCTIVE_FEATURE_SHARE));
}

const WEIGHT = {
  primaryCategory: 40,
  sharedCategory: 15,
  sharedCategoryCap: 3,
  sharedFeature: 3,
  sharedFeatureCap: 10,
  /** A shared feature that many products have: worth a little, never enough to qualify. */
  sharedCommonFeature: 1,
  sharedIndustry: 4,
  sharedIndustryCap: 3,
  pricingModel: 6,
  bothFreePlan: 4,
  sharedDeployment: 3,
  sharedDeploymentCap: 2,
} as const;

/** Optional display names so reasons can say "Same category: CRM Software". */
export interface AlternativeLabels {
  categories?: ReadonlyMap<string, string>;
  industries?: ReadonlyMap<string, string>;
}

export interface Alternative {
  product: Product;
  /** Similarity score, higher is more alike. Always above zero. */
  score: number;
  /** Plain-language reasons, strongest first. Never empty. */
  reasons: string[];
}

function shared<T>(a: readonly T[], b: readonly T[]): T[] {
  const set = new Set(b);
  return [...new Set(a)].filter((item) => set.has(item));
}

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

function names(slugs: readonly string[], labels: ReadonlyMap<string, string> | undefined): string[] {
  return slugs.map((slug) => labels?.get(slug)).filter((name): name is string => Boolean(name));
}

/** "A", "A, B" or "A, B and N more" for the names of `total` things; null when a name is missing. */
function listWithMore(names: readonly string[], total: number): string | null {
  if (names.length === 0 || names.length !== total) return null;
  const listed = names.slice(0, 2).join(", ");
  return total > 2 ? `${listed} and ${total - 2} more` : listed;
}

function categoriesOf(product: Product): string[] {
  return product.primaryCategory ? [product.primaryCategory, ...product.categorySlugs] : product.categorySlugs;
}

/** Features that at most `distinctiveLimit` of the given (distinct) products have. */
function distinctiveFeatures(products: readonly Product[]): Set<string> {
  const counts = new Map<string, number>();
  for (const p of products) {
    for (const slug of new Set(p.featureSlugs)) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const limit = distinctiveLimit(products.length);
  return new Set([...counts].filter(([, count]) => count <= limit).map(([slug]) => slug));
}

function compareAlternatives(a: Alternative, b: Alternative): number {
  return (
    b.score - a.score ||
    a.product.name.localeCompare(b.product.name, "en") ||
    (a.product.slug < b.product.slug ? -1 : a.product.slug > b.product.slug ? 1 : 0)
  );
}

function scoreOne(
  product: Product,
  other: Product,
  distinctive: ReadonlySet<string>,
  labels: AlternativeLabels | undefined,
): Alternative | null {
  const reasons: string[] = [];
  let score = 0;

  const samePrimary = Boolean(product.primaryCategory) && other.primaryCategory === product.primaryCategory;
  const sharedCategories = shared(categoriesOf(product), categoriesOf(other));
  const sharedFeatures = shared(product.featureSlugs, other.featureSlugs);
  const sharedDistinctive = sharedFeatures.filter((slug) => distinctive.has(slug));
  const sharedCommon = sharedFeatures.length - sharedDistinctive.length;

  // Relevance gate: no common category and too few distinctive features in common means not an alternative.
  if (sharedCategories.length === 0 && sharedDistinctive.length < MIN_SHARED_DISTINCTIVE_FEATURES) return null;

  if (samePrimary) {
    score += WEIGHT.primaryCategory;
    const name = labels?.categories?.get(product.primaryCategory);
    reasons.push(name ? `Same category: ${name}` : "Same primary category");
  }
  const otherCategories = sharedCategories.filter((slug) => !samePrimary || slug !== product.primaryCategory);
  const countedCategories = Math.min(sharedCategories.length, WEIGHT.sharedCategoryCap);
  score += countedCategories * WEIGHT.sharedCategory;
  if (otherCategories.length > 0) {
    const listed = listWithMore(names(otherCategories, labels?.categories), otherCategories.length);
    if (samePrimary) {
      reasons.push(
        listed ? `Also shares: ${listed}` : plural(otherCategories.length, "other shared category", "other shared categories"),
      );
    } else {
      reasons.push(
        otherCategories.length === 1 && listed
          ? `Shared category: ${listed}`
          : listed
            ? `Shared categories: ${listed}`
            : plural(otherCategories.length, "shared category", "shared categories"),
      );
    }
  }

  // Only distinctive features are named in the reasons, so the count is not padded by ones nearly everything has.
  score += Math.min(sharedDistinctive.length, WEIGHT.sharedFeatureCap) * WEIGHT.sharedFeature;
  score += Math.min(sharedCommon, WEIGHT.sharedFeatureCap) * WEIGHT.sharedCommonFeature;
  if (sharedDistinctive.length > 0) {
    reasons.push(plural(sharedDistinctive.length, "shared feature", "shared features"));
  }

  const sharedIndustries = shared(product.industrySlugs, other.industrySlugs);
  if (sharedIndustries.length > 0) {
    score += Math.min(sharedIndustries.length, WEIGHT.sharedIndustryCap) * WEIGHT.sharedIndustry;
    const industryNames = names(sharedIndustries, labels?.industries);
    reasons.push(
      sharedIndustries.length === 1 && industryNames.length === 1
        ? `Both serve ${industryNames[0]}`
        : plural(sharedIndustries.length, "shared industry", "shared industries"),
    );
  }

  // Unknown (null) pricing is neutral: it neither matches nor counts against.
  const model = product.pricing.model;
  if (model !== null && model === other.pricing.model) {
    score += WEIGHT.pricingModel;
    reasons.push(`Same pricing model: ${pricingModelLabel[model]}`);
  }
  if (product.pricing.freePlan === true && other.pricing.freePlan === true) {
    score += WEIGHT.bothFreePlan;
    reasons.push("Both free-plan products");
  }

  const sharedDeployment: Deployment[] = shared(product.deployment, other.deployment);
  if (sharedDeployment.length > 0) {
    score += Math.min(sharedDeployment.length, WEIGHT.sharedDeploymentCap) * WEIGHT.sharedDeployment;
    reasons.push(`Both offer ${sharedDeployment.map((d) => deploymentLabel[d].toLowerCase()).join(" and ")} deployment`);
  }

  return score > 0 && reasons.length > 0 ? { product: other, score, reasons } : null;
}

/**
 * Up to `limit` products most like `product`, most similar first. Never
 * includes `product` itself (matched by slug), never repeats a product, and
 * breaks score ties by name then slug so the result does not depend on the
 * order of `all`. A product with nothing relevant in common is left out, so
 * the list can be shorter than `limit` or empty. `limit` may be `Infinity`.
 */
export function getAlternatives(
  product: Product,
  all: readonly Product[],
  limit: number = DEFAULT_ALTERNATIVES_LIMIT,
  labels?: AlternativeLabels,
): Alternative[] {
  if (Number.isNaN(limit) || limit <= 0) return [];
  const seen = new Set<string>([product.slug]);
  const others: Product[] = [];
  for (const other of all) {
    if (seen.has(other.slug)) continue;
    seen.add(other.slug);
    others.push(other);
  }
  const distinctive = distinctiveFeatures([product, ...others]);
  const scored: Alternative[] = [];
  for (const other of others) {
    const alternative = scoreOne(product, other, distinctive, labels);
    if (alternative) scored.push(alternative);
  }
  return scored.sort(compareAlternatives).slice(0, Math.floor(limit));
}

/** Display-name lookups for `getAlternatives` reasons, from the taxonomy lists. */
export function buildAlternativeLabels(
  categories: readonly { slug: string; name: string }[],
  industries: readonly { slug: string; name: string }[],
): AlternativeLabels {
  return {
    categories: new Map(categories.map((c) => [c.slug, c.name])),
    industries: new Map(industries.map((i) => [i.slug, i.name])),
  };
}
