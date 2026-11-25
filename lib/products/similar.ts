import type { Product } from "@/lib/data/types";

/**
 * Products like `product`, for the profile's "Similar products" list and the
 * interim alternatives tab. Interim helper: the alternatives task may replace
 * it with a fuller scoring engine.
 *
 * Ranked by, in order: same primary category, number of shared categories,
 * number of shared features. Products sharing none of these are left out.
 * Ties go to editorial picks, then the editorial trending order, then name.
 * Never uses ratings or reviews.
 */
export function similarProducts(product: Product, all: readonly Product[], limit = 4): Product[] {
  if (limit <= 0) return [];
  const categories = new Set(product.categorySlugs);
  const features = new Set(product.featureSlugs);

  return all
    .filter((other) => other.slug !== product.slug)
    .map((other) => ({
      other,
      samePrimary: other.primaryCategory === product.primaryCategory ? 1 : 0,
      sharedCategories: other.categorySlugs.filter((slug) => categories.has(slug)).length,
      sharedFeatures: other.featureSlugs.filter((slug) => features.has(slug)).length,
    }))
    .filter((s) => s.samePrimary + s.sharedCategories + s.sharedFeatures > 0)
    .sort(
      (a, b) =>
        b.samePrimary - a.samePrimary ||
        b.sharedCategories - a.sharedCategories ||
        b.sharedFeatures - a.sharedFeatures ||
        Number(b.other.featured) - Number(a.other.featured) ||
        (a.other.trendingRank ?? Infinity) - (b.other.trendingRank ?? Infinity) ||
        a.other.name.localeCompare(b.other.name),
    )
    .slice(0, limit)
    .map((s) => s.other);
}
