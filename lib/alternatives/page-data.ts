/**
 * Everything /alternatives/[product] renders, resolved from the data layer in
 * one place so the page and its metadata agree. Deduplicated per request with
 * React `cache`.
 */
import { cache } from "react";
import {
  getCategories,
  getIndustries,
  getProduct,
  getProducts,
  getVendors,
  type Category,
  type Product,
  type Vendor,
} from "@/lib/data";
import { buildAlternativeLabels, getAlternatives, type Alternative } from "./score";

/** How many alternatives the page lists. */
export const ALTERNATIVES_PAGE_LIMIT = 10;

export interface AlternativesPageData {
  product: Product;
  vendor: Vendor | null;
  category: Category | null;
  alternatives: Alternative[];
  /** Vendor display names for the source and every alternative. */
  vendorNames: Map<string, string>;
  title: string;
  description: string;
}

async function loadAlternativesPage(slug: string): Promise<AlternativesPageData | null> {
  const product = await getProduct(slug);
  if (!product) return null;
  const [products, vendors, categories, industries] = await Promise.all([
    getProducts(),
    getVendors(),
    getCategories(),
    getIndustries(),
  ]);
  const alternatives = getAlternatives(
    product,
    products,
    ALTERNATIVES_PAGE_LIMIT,
    buildAlternativeLabels(categories, industries),
  );
  const category = categories.find((c) => c.slug === product.primaryCategory) ?? null;
  // Not "similar products in <category>": many alternatives share features, not the category.
  const listedUnder = category ? ` (listed under ${category.name})` : "";
  return {
    product,
    vendor: vendors.find((v) => v.slug === product.vendorSlug) ?? null,
    category,
    alternatives,
    vendorNames: new Map(vendors.map((v) => [v.slug, v.name])),
    title: `Alternatives to ${product.name}`,
    description:
      alternatives.length > 0
        ? `${alternatives.length === 1 ? "1 product" : `${alternatives.length} products`} similar to ${product.name}${listedUnder}, listed by how much they share with it: categories, distinctive features, pricing model, industries and deployment. Not ranked by ratings or popularity.`
        : `Products similar to ${product.name}${listedUnder} will be listed here when we have matches.`,
  };
}

/** The alternatives bundle for `slug`, or `null` for an unknown product. */
export const getAlternativesPage = cache(loadAlternativesPage);

/** Every product slug, for `generateStaticParams`. */
export async function getAlternativesParams(): Promise<{ product: string }[]> {
  return (await getProducts()).map((p) => ({ product: p.slug }));
}
