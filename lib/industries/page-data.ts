/**
 * Data for the industry index and industry pages, assembled from the data
 * layer. Pure and server-side: pages call these once at build time.
 *
 * Category counts follow R10 (the distinct union of products tagged with the
 * category or any direct child), the same as the category pages.
 */
import { curateTopProducts, type CategoryCount } from "@/lib/categories/page-data";
import {
  getArticles,
  getCategory,
  getIndustries,
  getIndustry,
  getProductsByIndustry,
  getProductsInCategoryTree,
  type Article,
  type Category,
  type Industry,
  type Product,
} from "@/lib/data";

/** Most products in the "Editor's picks" shortlist. */
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
  /** Editor-curated picks: featured first, then trending rank. Not a ranking by ratings. */
  picks: Product[];
  /** Recommended categories in the content's order, with tree-union product counts. */
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
 * Related reading for an industry: every article whose related categories
 * overlap the industry's recommended categories, plus every buying guide
 * (buying guides are general pre-purchase advice that applies to any
 * industry). Newest `publishedAt` first, then title, capped at
 * `INDUSTRY_ARTICLE_LIMIT`. Empty when nothing qualifies. Does not mutate.
 */
export function selectRelatedArticles(
  articles: readonly Article[],
  recommendedCategorySlugs: readonly string[],
  limit = INDUSTRY_ARTICLE_LIMIT,
): Article[] {
  const wanted = new Set(recommendedCategorySlugs);
  return articles
    .filter((a) => a.kind === "buying-guide" || a.relatedCategorySlugs.some((s) => wanted.has(s)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title, "en"))
    .slice(0, limit);
}

/** The bundle an industry page needs, or `null` for an unknown slug. */
export async function getIndustryPageData(slug: string): Promise<IndustryPageData | null> {
  const industry = await getIndustry(slug);
  if (!industry) return null;

  const [products, articles, categories] = await Promise.all([
    getProductsByIndustry(slug),
    getArticles(),
    Promise.all(
      industry.recommendedCategorySlugs.map(async (categorySlug) => {
        const category = await getCategory(categorySlug);
        return category
          ? { category, count: (await getProductsInCategoryTree(categorySlug)).length }
          : null;
      }),
    ),
  ]);

  return {
    industry,
    products,
    count: products.length,
    picks: curateTopProducts(products, INDUSTRY_PICK_LIMIT),
    categories: categories.filter((c): c is CategoryCount => c !== null),
    articles: selectRelatedArticles(articles, industry.recommendedCategorySlugs),
  };
}

/** Every industry with its product count and lead categories, in catalogue order. */
export async function getIndustryIndexData(): Promise<IndustryIndexEntry[]> {
  const industries = await getIndustries();
  return Promise.all(
    industries.map(async (industry) => {
      const categories = await Promise.all(
        industry.recommendedCategorySlugs.slice(0, INDEX_CATEGORY_LIMIT).map((s) => getCategory(s)),
      );
      return {
        industry,
        count: (await getProductsByIndustry(industry.slug)).length,
        categories: categories.filter((c): c is Category => c !== null),
      };
    }),
  );
}
