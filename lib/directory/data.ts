/**
 * Server-side assembly of what the directory listing needs, as a compact,
 * plain-JSON projection (no descriptions, plans, FAQs, pros/cons) so the
 * client payload for ~60 products stays small.
 */
import {
  getCategories,
  getFeatures,
  getIndustries,
  getIntegrations,
  getProducts,
  getVendors,
  resolveLogo,
  type Product,
  type VendorLogo,
} from "@/lib/data";
import { buildCategoryChildren, type DirectoryItem } from "./query";

export interface DirectoryProduct extends DirectoryItem {
  vendorName: string | null;
  tagline: string;
  brandColor: string;
  logo?: VendorLogo | null;
  primaryCategory: string;
  /** At most three. */
  highlights: string[];
}

export interface Label {
  slug: string;
  name: string;
}

export interface DirectoryLabels {
  /** Catalogue order; children follow their parent in `categoryChildren`. */
  categories: (Label & { parentSlug: string | null })[];
  industries: Label[];
  features: (Label & { group: string })[];
  integrations: Label[];
}

export interface DirectoryData {
  products: DirectoryProduct[];
  labels: DirectoryLabels;
  categoryChildren: Record<string, string[]>;
  /** False while no product has a review-backed rating (the rating filter and sort are hidden). */
  ratingsAvailable: boolean;
}

export function toDirectoryProduct(
  p: Product,
  vendorName: string | null,
  logo: VendorLogo | null = p.logo ?? null,
): DirectoryProduct {
  return {
    slug: p.slug,
    name: p.name,
    vendorName,
    tagline: p.tagline,
    brandColor: p.brandColor,
    ...(logo ? { logo } : {}),
    primaryCategory: p.primaryCategory,
    categorySlugs: p.categorySlugs,
    industrySlugs: p.industrySlugs,
    featureSlugs: p.featureSlugs,
    integrationSlugs: p.integrationSlugs,
    deployment: p.deployment,
    companySizes: p.companySizes,
    pricing: { model: p.pricing.model, freePlan: p.pricing.freePlan, freeTrial: p.pricing.freeTrial },
    rating: p.rating,
    reviewCount: p.reviewCount,
    addedAt: p.addedAt,
    trendingRank: p.trendingRank,
    highlights: p.highlights.slice(0, 3),
  };
}

export function hasRating(p: Pick<Product, "rating" | "reviewCount">): boolean {
  return p.rating !== null && Number.isFinite(p.rating) && p.rating > 0 && p.reviewCount > 0;
}

/**
 * Directory data for the listing, optionally narrowed to a subset of the
 * catalogue (e.g. the editor-curated list). Labels cover the whole taxonomy;
 * the UI shows only values that occur in the listed products.
 */
export async function getDirectoryData(include?: (p: Product) => boolean): Promise<DirectoryData> {
  const [all, vendors, categories, industries, features, integrations] = await Promise.all([
    getProducts(),
    getVendors(),
    getCategories(),
    getIndustries(),
    getFeatures(),
    getIntegrations(),
  ]);
  const vendorBySlug = new Map(vendors.map((v) => [v.slug, v]));
  const products = include ? all.filter(include) : all;
  const used = (pick: (p: Product) => string[]) => new Set(products.flatMap(pick));
  const usedIndustries = used((p) => p.industrySlugs);
  const usedFeatures = used((p) => p.featureSlugs);
  const usedIntegrations = used((p) => p.integrationSlugs);

  return {
    products: products.map((p) => {
      const vendor = vendorBySlug.get(p.vendorSlug);
      return toDirectoryProduct(p, vendor?.name ?? null, resolveLogo(p, vendor));
    }),
    labels: {
      categories: categories.map((c) => ({ slug: c.slug, name: c.name, parentSlug: c.parentSlug })),
      industries: industries
        .filter((i) => usedIndustries.has(i.slug))
        .map((i) => ({ slug: i.slug, name: i.name })),
      features: features
        .filter((f) => usedFeatures.has(f.slug))
        .map((f) => ({ slug: f.slug, name: f.name, group: f.group })),
      integrations: integrations
        .filter((i) => usedIntegrations.has(i.slug))
        .map((i) => ({ slug: i.slug, name: i.name })),
    },
    categoryChildren: buildCategoryChildren(categories),
    ratingsAvailable: products.some(hasRating),
  };
}
