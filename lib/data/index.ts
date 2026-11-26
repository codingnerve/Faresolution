/**
 * Public data access layer. Pages and components import from here only, never
 * from the raw content arrays, so a real API can replace this module later.
 *
 * All functions are async and return `null` / `[]` for unknown input.
 *
 * Results are shared read-only references to the underlying content: callers
 * must not mutate returned objects or their nested arrays. (List accessors
 * return a fresh outer array, but the items inside are the shared objects.)
 */
import { articles } from "./content/articles";
import { authors } from "./content/authors";
import { categories } from "./content/categories";
import { popularComparisons } from "./content/comparisons";
import { features } from "./content/features";
import { industries } from "./content/industries";
import { integrations } from "./content/integrations";
import { products } from "./content/products";
import { vendors } from "./content/vendors";
import type {
  Article,
  ArticleKind,
  Author,
  Category,
  CategoryNode,
  Feature,
  Industry,
  Integration,
  PopularComparison,
  Product,
  Vendor,
  VendorLogo,
} from "./types";

export type * from "./types";

function indexBySlug<T extends { slug: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.slug, item]));
}

// Lookup maps are built once per module instance. `Map` (not a plain object)
// keeps keys like "constructor" or "__proto__" from resolving to anything.
const productBySlug = indexBySlug(products);
const categoryBySlug = indexBySlug(categories);
const industryBySlug = indexBySlug(industries);
const vendorBySlug = indexBySlug(vendors);
const integrationBySlug = indexBySlug(integrations);
const authorBySlug = indexBySlug(authors);
const articleByKey = new Map<string, Article>(
  articles.map((a) => [`${a.kind}/${a.slug}`, a]),
);

export async function getProducts(): Promise<Product[]> {
  return [...products];
}

export async function getProduct(slug: string): Promise<Product | null> {
  return productBySlug.get(slug) ?? null;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return products.filter((p) => p.categorySlugs.includes(slug));
}

/**
 * Products listed under a category including its subcategories: the distinct
 * union of products tagged with the category or any direct child, in catalogue
 * order. Equals `getProductsByCategory` for a category without children.
 */
export async function getProductsInCategoryTree(slug: string): Promise<Product[]> {
  if (!categoryBySlug.has(slug)) return [];
  const slugs = new Set([slug, ...categories.filter((c) => c.parentSlug === slug).map((c) => c.slug)]);
  return products.filter((p) => p.categorySlugs.some((s) => slugs.has(s)));
}

export async function getProductsByIndustry(slug: string): Promise<Product[]> {
  return products.filter((p) => p.industrySlugs.includes(slug));
}

export async function getCategories(): Promise<Category[]> {
  return [...categories];
}

export async function getCategory(slug: string): Promise<Category | null> {
  return categoryBySlug.get(slug) ?? null;
}

/** Top-level categories, each with its direct children (one level deep in the data). */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  return categories
    .filter((c) => c.parentSlug === null)
    .map((root) => ({
      ...root,
      children: categories.filter((c) => c.parentSlug === root.slug),
    }));
}

export async function getIndustries(): Promise<Industry[]> {
  return [...industries];
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  return industryBySlug.get(slug) ?? null;
}

export async function getVendors(): Promise<Vendor[]> {
  return [...vendors];
}

export async function getVendor(slug: string): Promise<Vendor | null> {
  return vendorBySlug.get(slug) ?? null;
}

export async function getFeatures(): Promise<Feature[]> {
  return [...features];
}

export async function getIntegrations(): Promise<Integration[]> {
  return [...integrations];
}

export async function getIntegration(slug: string): Promise<Integration | null> {
  return integrationBySlug.get(slug) ?? null;
}

export async function getArticles(kind?: ArticleKind): Promise<Article[]> {
  return kind ? articles.filter((a) => a.kind === kind) : [...articles];
}

export async function getArticle(kind: ArticleKind, slug: string): Promise<Article | null> {
  return articleByKey.get(`${kind}/${slug}`) ?? null;
}

export async function getAuthor(slug: string): Promise<Author | null> {
  return authorBySlug.get(slug) ?? null;
}

export async function getPopularComparisons(): Promise<PopularComparison[]> {
  return [...popularComparisons];
}

/** Resolve a product's logo, preferring the product-specific logo over its vendor's. */
export function resolveLogo(
  product?: Pick<Product, "logo"> | null,
  vendor?: Pick<Vendor, "logo"> | null,
): VendorLogo | null {
  return product?.logo ?? vendor?.logo ?? null;
}
