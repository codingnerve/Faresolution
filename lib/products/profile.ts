/**
 * Everything a product profile page renders, resolved from the data layer in
 * one place so the layout and the eight tab pages agree. Deduplicated per
 * request with React `cache` (layout, page and metadata all ask for it).
 */
import { cache } from "react";
import {
  getCategories,
  getFeatures,
  getIndustries,
  getIntegrations,
  getPopularComparisons,
  getProduct,
  getProducts,
  getVendors,
  type Category,
  type Feature,
  type Industry,
  type Integration,
  type Product,
  type Vendor,
} from "@/lib/data";
import { similarProducts } from "./similar";

export interface FeatureGroup {
  group: string;
  features: Feature[];
}

export interface ProfileIntegration {
  integration: Integration;
  /** Set when the integration is itself a product with a profile here. */
  productSlug: string | null;
}

export interface ProfileComparison {
  /** Products in the comparison, this product first. */
  products: Product[];
  /** Slugs in the comparison's editorial order (its canonical URL). */
  slugs: string[];
}

export interface ProductProfile {
  product: Product;
  vendor: Vendor | null;
  primaryCategory: Category | null;
  /** The product's categories, primary first. */
  categories: Category[];
  industries: Industry[];
  /** Features grouped by taxonomy group, groups and features in taxonomy order. */
  featureGroups: FeatureGroup[];
  featureCount: number;
  integrations: ProfileIntegration[];
  similar: Product[];
  /** Vendor display names for `similar` (and any other product on the page). */
  vendorNames: Map<string, string>;
  comparisons: ProfileComparison[];
}

/** How many similar products the profile computes (the overview shows fewer). */
export const SIMILAR_LIMIT = 6;

function pickInOrder<T extends { slug: string }>(items: readonly T[], slugs: readonly string[]): T[] {
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  return slugs.map((slug) => bySlug.get(slug)).filter((item): item is T => item !== undefined);
}

async function loadProductProfile(slug: string): Promise<ProductProfile | null> {
  const product = await getProduct(slug);
  if (!product) return null;

  const [products, vendors, categories, industries, features, integrations, comparisons] = await Promise.all([
    getProducts(),
    getVendors(),
    getCategories(),
    getIndustries(),
    getFeatures(),
    getIntegrations(),
    getPopularComparisons(),
  ]);

  const vendorNames = new Map(vendors.map((v) => [v.slug, v.name]));
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const ownCategories = pickInOrder(categories, [
    product.primaryCategory,
    ...product.categorySlugs.filter((s) => s !== product.primaryCategory),
  ]);

  const ownFeatures = new Set(product.featureSlugs);
  const featureGroups: FeatureGroup[] = [];
  for (const feature of features) {
    if (!ownFeatures.has(feature.slug)) continue;
    const group = featureGroups.find((g) => g.group === feature.group);
    if (group) group.features.push(feature);
    else featureGroups.push({ group: feature.group, features: [feature] });
  }

  const ownComparisons: ProfileComparison[] = [];
  for (const comparison of comparisons) {
    if (!comparison.slugs.includes(slug)) continue;
    const members = comparison.slugs.map((s) => productBySlug.get(s));
    if (members.some((p) => p === undefined)) continue;
    const resolved = members as Product[];
    ownComparisons.push({
      slugs: [...comparison.slugs],
      products: [product, ...resolved.filter((p) => p.slug !== slug)],
    });
  }

  return {
    product,
    vendor: vendors.find((v) => v.slug === product.vendorSlug) ?? null,
    primaryCategory: ownCategories.find((c) => c.slug === product.primaryCategory) ?? null,
    categories: ownCategories,
    industries: pickInOrder(industries, product.industrySlugs),
    featureGroups,
    featureCount: featureGroups.reduce((n, g) => n + g.features.length, 0),
    integrations: pickInOrder(integrations, product.integrationSlugs).map((integration) => ({
      integration,
      productSlug: productBySlug.has(integration.slug) ? integration.slug : null,
    })),
    similar: similarProducts(product, products, SIMILAR_LIMIT),
    vendorNames,
    comparisons: ownComparisons,
  };
}

/** The profile bundle for `slug`, or `null` for an unknown product. */
export const getProductProfile = cache(loadProductProfile);

/** Every product slug, for `generateStaticParams`. */
export async function getProductSlugs(): Promise<{ slug: string }[]> {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}
