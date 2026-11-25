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
 * the source or at least `MIN_SHARED_FEATURES` features. Pricing model, free
 * plan, industry and deployment only rank products that already pass; two
 * unrelated tools that both happen to be cloud-based are not alternatives.
 */
import type { Deployment, Product } from "@/lib/data/types";
import { deploymentLabel, pricingModelLabel } from "@/lib/directory/labels";

export const DEFAULT_ALTERNATIVES_LIMIT = 8;

/** Shared features needed on their own (no shared category) to count as an alternative. */
export const MIN_SHARED_FEATURES = 6;

const WEIGHT = {
  primaryCategory: 40,
  sharedCategory: 15,
  sharedCategoryCap: 3,
  sharedFeature: 3,
  sharedFeatureCap: 10,
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

function categoriesOf(product: Product): string[] {
  return product.primaryCategory ? [product.primaryCategory, ...product.categorySlugs] : product.categorySlugs;
}

function compareAlternatives(a: Alternative, b: Alternative): number {
  return (
    b.score - a.score ||
    a.product.name.localeCompare(b.product.name, "en") ||
    (a.product.slug < b.product.slug ? -1 : a.product.slug > b.product.slug ? 1 : 0)
  );
}

function scoreOne(product: Product, other: Product, labels: AlternativeLabels | undefined): Alternative | null {
  const reasons: string[] = [];
  let score = 0;

  const samePrimary = Boolean(product.primaryCategory) && other.primaryCategory === product.primaryCategory;
  const sharedCategories = shared(categoriesOf(product), categoriesOf(other));
  const sharedFeatures = shared(product.featureSlugs, other.featureSlugs);

  // Relevance gate: no common category and few common features means not an alternative.
  if (sharedCategories.length === 0 && sharedFeatures.length < MIN_SHARED_FEATURES) return null;

  if (samePrimary) {
    score += WEIGHT.primaryCategory;
    const name = labels?.categories?.get(product.primaryCategory);
    reasons.push(name ? `Same category: ${name}` : "Same primary category");
  }
  const otherCategories = sharedCategories.filter((slug) => !samePrimary || slug !== product.primaryCategory);
  const countedCategories = Math.min(sharedCategories.length, WEIGHT.sharedCategoryCap);
  score += countedCategories * WEIGHT.sharedCategory;
  if (otherCategories.length > 0) {
    const categoryNames = names(otherCategories, labels?.categories);
    const listed = categoryNames.slice(0, 2).join(", ");
    if (samePrimary) {
      reasons.push(
        listed && categoryNames.length === otherCategories.length
          ? `Also shares: ${listed}`
          : `${plural(otherCategories.length, "other shared category", "other shared categories")}`,
      );
    } else {
      reasons.push(
        otherCategories.length === 1 && listed
          ? `Shared category: ${listed}`
          : listed && categoryNames.length === otherCategories.length
            ? `Shared categories: ${listed}${otherCategories.length > 2 ? ` and ${otherCategories.length - 2} more` : ""}`
            : plural(otherCategories.length, "shared category", "shared categories"),
      );
    }
  }

  if (sharedFeatures.length > 0) {
    score += Math.min(sharedFeatures.length, WEIGHT.sharedFeatureCap) * WEIGHT.sharedFeature;
    reasons.push(plural(sharedFeatures.length, "shared feature", "shared features"));
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
 * the list can be shorter than `limit` or empty.
 */
export function getAlternatives(
  product: Product,
  all: readonly Product[],
  limit: number = DEFAULT_ALTERNATIVES_LIMIT,
  labels?: AlternativeLabels,
): Alternative[] {
  if (!Number.isFinite(limit) && limit !== Infinity) return [];
  if (limit <= 0) return [];
  const seen = new Set<string>([product.slug]);
  const scored: Alternative[] = [];
  for (const other of all) {
    if (seen.has(other.slug)) continue;
    seen.add(other.slug);
    const alternative = scoreOne(product, other, labels);
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
