/**
 * Data for the industry index and industry pages, assembled from the data
 * layer. Pure and server-side: pages call these once at build time.
 *
 * Category counts follow R10 (the distinct union of products tagged with the
 * category or any direct child), the same as the category pages, and cover
 * the whole directory, not only products serving the industry.
 */
import { curateTopProducts, withCounts, type CategoryCount } from "@/lib/categories/page-data";
import {
  getArticles,
  getCategories,
  getIndustries,
  getIndustry,
  getProductsByIndustry,
  type Article,
  type Category,
  type Industry,
  type Product,
} from "@/lib/data";

/** Most products in the picks shortlist. */
export const INDUSTRY_PICK_LIMIT = 5;
/** Most related articles shown. */
export const INDUSTRY_ARTICLE_LIMIT = 4;
/** Most lead categories named per industry on the index. */
export const INDEX_CATEGORY_LIMIT = 3;

export interface IndustryPageData {
  industry: Industry;
  /** Every product that serves the industry, in catalogue order. */
  products: Product[];
  count: number;
  /** Editorial shortlist, see `curateIndustryPicks`. Not a ranking by ratings. */
  picks: Product[];
  /** True when every pick sits in one of the industry's recommended categories (or a subcategory). */
  picksInRecommended: boolean;
  /** Recommended categories in the content's order, with directory-wide tree-union product counts. */
  categories: CategoryCount[];
  /** Related reading, see `selectRelatedArticles`. */
  articles: Article[];
}

export interface IndustryIndexEntry {
  industry: Industry;
  /** Products serving the industry. */
  count: number;
  /** The first recommended categories, to hint at where to start. */
  categories: Category[];
}

/**
 * Related reading for an industry, in two tiers, capped at `limit`:
 * 1. articles whose related categories overlap the industry's recommended
 *    categories, most overlapping categories first, then newest
 *    `publishedAt`, then title;
 * 2. only if slots remain, at most one other buying guide (newest first), as
 *    general pre-purchase advice.
 * Empty when nothing qualifies. Does not mutate.
 */
export function selectRelatedArticles(
  articles: readonly Article[],
  recommendedCategorySlugs: readonly string[],
  limit = INDUSTRY_ARTICLE_LIMIT,
): Article[] {
  const wanted = new Set(recommendedCategorySlugs);
  const overlap = (a: Article) => a.relatedCategorySlugs.filter((s) => wanted.has(s)).length;
  const newest = (a: Article, b: Article) =>
    b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "en");

  const matches = articles
    .map((article) => ({ article, overlap: overlap(article) }))
    .filter((m) => m.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || newest(a.article, b.article))
    .map((m) => m.article)
    .slice(0, limit);
  if (matches.length >= limit) return matches;

  const otherGuide = articles
    .filter((a) => a.kind === "buying-guide" && overlap(a) === 0)
    .sort(newest)
    .slice(0, 1);
  return [...matches, ...otherGuide];
}

/**
 * Editorial shortlist for an industry: products in the recommended
 * categories (or their subcategories) first, each group ordered featured
 * first, then trending rank, then name; the rest only fill remaining slots.
 * Does not mutate.
 */
export function curateIndustryPicks(
  products: readonly Product[],
  recommendedTree: ReadonlySet<string>,
  limit = INDUSTRY_PICK_LIMIT,
): Product[] {
  const inRecommended = (p: Product) => p.categorySlugs.some((s) => recommendedTree.has(s));
  const first = curateTopProducts(products.filter(inRecommended), limit);
  if (first.length >= limit) return first;
  return [...first, ...curateTopProducts(products.filter((p) => !inRecommended(p)), limit - first.length)];
}

/** The bundle an industry page needs, or `null` for an unknown slug. */
export async function getIndustryPageData(slug: string): Promise<IndustryPageData | null> {
  const industry = await getIndustry(slug);
  if (!industry) return null;

  const [products, articles, all] = await Promise.all([getProductsByIndustry(slug), getArticles(), getCategories()]);
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const recommended = industry.recommendedCategorySlugs
    .map((s) => bySlug.get(s))
    .filter((c): c is Category => c !== undefined);
  const recommendedSlugs = new Set(recommended.map((c) => c.slug));
  const tree = new Set([
    ...recommendedSlugs,
    ...all.filter((c) => c.parentSlug !== null && recommendedSlugs.has(c.parentSlug)).map((c) => c.slug),
  ]);
  const picks = curateIndustryPicks(products, tree);

  return {
    industry,
    products,
    count: products.length,
    picks,
    picksInRecommended: picks.every((p) => p.categorySlugs.some((s) => tree.has(s))),
    categories: await withCounts(recommended),
    articles: selectRelatedArticles(articles, industry.recommendedCategorySlugs),
  };
}

/** Every industry with its product count and lead categories, in catalogue order. */
export async function getIndustryIndexData(): Promise<IndustryIndexEntry[]> {
  const [industries, all] = await Promise.all([getIndustries(), getCategories()]);
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  return Promise.all(
    industries.map(async (industry) => ({
      industry,
      count: (await getProductsByIndustry(industry.slug)).length,
      categories: industry.recommendedCategorySlugs
        .map((s) => bySlug.get(s))
        .filter((c): c is Category => c !== undefined)
        .slice(0, INDEX_CATEGORY_LIMIT),
    })),
  );
}
