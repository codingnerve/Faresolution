/**
 * Data for the category index and category pages, assembled from the data
 * layer. Pure and server-side: pages call these once at build time.
 *
 * Counts follow R10: a category's listing is the distinct union of products
 * tagged with it or any direct child, which equals the direct count for a
 * category without children.
 */
import {
  getCategories,
  getCategory,
  getProductsInCategoryTree,
  type Category,
  type Product,
} from "@/lib/data";

/** Most products shown in the "Top products" list. */
export const TOP_PRODUCT_LIMIT = 5;

export interface CategoryCount {
  category: Category;
  /** Products listed under the category (tree union). */
  count: number;
}

export interface CategoryPageData {
  category: Category;
  parent: Category | null;
  children: CategoryCount[];
  /** Everything listed under the category, in catalogue order. */
  treeProducts: Product[];
  count: number;
  /** Editor-curated picks: featured first, then trending rank. */
  topProducts: Product[];
  related: CategoryCount[];
}

export interface CategoryIndexEntry extends CategoryCount {
  children: CategoryCount[];
}

/** Featured first, then lower trending rank (unranked last), then name. Does not mutate. */
export function curateTopProducts(products: readonly Product[], limit = TOP_PRODUCT_LIMIT): Product[] {
  return [...products]
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (a.trendingRank ?? Infinity) - (b.trendingRank ?? Infinity) ||
        a.name.localeCompare(b.name, "en"),
    )
    .slice(0, limit);
}

/** Each category with its tree-union product count (R10), in the given order. */
export async function withCounts(categories: readonly Category[]): Promise<CategoryCount[]> {
  return Promise.all(
    categories.map(async (category) => ({
      category,
      count: (await getProductsInCategoryTree(category.slug)).length,
    })),
  );
}

/** The bundle a category page needs, or `null` for an unknown slug. */
export async function getCategoryPageData(slug: string): Promise<CategoryPageData | null> {
  const category = await getCategory(slug);
  if (!category) return null;

  const all = await getCategories();
  const bySlug = new Map(all.map((c) => [c.slug, c]));
  const treeProducts = await getProductsInCategoryTree(slug);
  const related = category.relatedSlugs
    .filter((s) => s !== slug)
    .map((s) => bySlug.get(s))
    .filter((c): c is Category => c !== undefined);

  return {
    category,
    parent: category.parentSlug ? (bySlug.get(category.parentSlug) ?? null) : null,
    children: await withCounts(all.filter((c) => c.parentSlug === slug)),
    treeProducts,
    count: treeProducts.length,
    topProducts: curateTopProducts(treeProducts),
    related: await withCounts(related),
  };
}

/** Every top-level category with its subcategories and counts, in catalogue order. */
export async function getCategoryIndexData(): Promise<CategoryIndexEntry[]> {
  const all = await getCategories();
  const roots = all.filter((c) => c.parentSlug === null);
  return Promise.all(
    roots.map(async (root) => {
      const [self] = await withCounts([root]);
      return { ...self, children: await withCounts(all.filter((c) => c.parentSlug === root.slug)) };
    }),
  );
}
