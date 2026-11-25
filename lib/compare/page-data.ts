/**
 * Everything /compare/[slug] renders, resolved from the data layer in one
 * place so the page and its metadata agree. Deduplicated per request with
 * React `cache`.
 */
import { cache } from "react";
import { getAlternatives } from "@/lib/alternatives/score";
import {
  getCategories,
  getFeatures,
  getIntegrations,
  getPopularComparisons,
  getProducts,
  getVendors,
  type Product,
} from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import { buildFeatureRows, buildRows, COMPARE_SECTION_LABEL, type CompareRow, type CompareSection } from "./diff";
import { buildCompareSlug, compareHref, compareHrefWith, compareHrefWithout, resolveCompareSlug } from "./slug";

export interface CompareProductView {
  product: Product;
  vendorName: string | null;
  categoryName: string | null;
  /** The comparison without this product, or /compare when fewer than two would remain. */
  removeHref: string;
}

export interface CompareRowGroupData {
  key: CompareSection;
  label: string;
  rows: CompareRow[];
}

export interface RelatedAlternative {
  product: Product;
  vendorName: string | null;
  /** The comparison with this product added, or null when it is full. */
  addHref: string | null;
}

export interface OtherComparison {
  href: string;
  label: string;
}

export interface ComparePageData {
  /** Canonical compare slug (products sorted by slug). */
  slug: string;
  path: string;
  shareUrl: string;
  slugs: string[];
  items: CompareProductView[];
  groups: CompareRowGroupData[];
  /** True for an editor-picked comparison (prerendered and indexable). */
  isPopular: boolean;
  related: RelatedAlternative[];
  otherComparisons: OtherComparison[];
  /** "A vs B vs C" */
  versusLabel: string;
  title: string;
  description: string;
}

export type ComparePageResult =
  | { kind: "invalid" }
  | { kind: "redirect"; canonical: string }
  | { kind: "ok"; data: ComparePageData };

const RELATED_LIMIT = 4;
const OTHER_COMPARISONS_LIMIT = 4;
const SECTION_ORDER: CompareSection[] = ["overview", "pricing", "product", "ratings", "features"];

/** "A", "A and B", "A, B and C". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

async function loadComparePage(slug: string): Promise<ComparePageResult> {
  const [products, vendors, categories, features, integrations, popular] = await Promise.all([
    getProducts(),
    getVendors(),
    getCategories(),
    getFeatures(),
    getIntegrations(),
    getPopularComparisons(),
  ]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const resolved = resolveCompareSlug(slug, new Set(productBySlug.keys()));
  if (!resolved.ok) return { kind: "invalid" };
  if (!resolved.isCanonical) return { kind: "redirect", canonical: resolved.canonical };

  const vendorName = new Map(vendors.map((v) => [v.slug, v.name]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const slugs = resolved.slugs;
  const compared = slugs.map((s) => productBySlug.get(s)!);

  const items: CompareProductView[] = compared.map((product) => ({
    product,
    vendorName: vendorName.get(product.vendorSlug) ?? null,
    categoryName: categoryName.get(product.primaryCategory) ?? null,
    removeHref: compareHrefWithout(slugs, product.slug),
  }));

  const rows = [
    ...buildRows(compared, {
      featureName: new Map(features.map((f) => [f.slug, f.name])),
      integrationName: new Map(integrations.map((i) => [i.slug, i.name])),
    }),
    ...buildFeatureRows(compared, features),
  ];
  const groups: CompareRowGroupData[] = SECTION_ORDER.map((key) => ({
    key,
    label: COMPARE_SECTION_LABEL[key],
    rows: rows.filter((r) => r.section === key),
  })).filter((g) => g.rows.length > 0);

  // Alternatives: products similar to any compared one, ranked by how many of
  // the compared products they resemble, then by their best position.
  const inComparison = new Set(slugs);
  const score = new Map<string, { hits: number; best: number }>();
  for (const product of compared) {
    getAlternatives(product, products, 8).forEach(({ product: other }, rank) => {
      if (inComparison.has(other.slug)) return;
      const current = score.get(other.slug) ?? { hits: 0, best: Infinity };
      score.set(other.slug, { hits: current.hits + 1, best: Math.min(current.best, rank) });
    });
  }
  const related: RelatedAlternative[] = [...score.entries()]
    .sort(([a, x], [b, y]) => y.hits - x.hits || x.best - y.best || a.localeCompare(b))
    .slice(0, RELATED_LIMIT)
    .map(([s]) => {
      const product = productBySlug.get(s)!;
      return {
        product,
        vendorName: vendorName.get(product.vendorSlug) ?? null,
        addHref: compareHrefWith(slugs, s),
      };
    });

  const otherComparisons: OtherComparison[] = popular
    .filter((c) => buildCompareSlug(c.slugs) !== resolved.canonical && c.slugs.some((s) => inComparison.has(s)))
    .filter((c) => c.slugs.every((s) => productBySlug.has(s)))
    .slice(0, OTHER_COMPARISONS_LIMIT)
    .map((c) => ({
      href: compareHref(c.slugs),
      label: c.slugs.map((s) => productBySlug.get(s)!.name).join(" vs "),
    }));

  const names = compared.map((p) => p.name);
  const versusLabel = names.join(" vs ");
  const path = compareHref(slugs);
  const sharedCategory = compared.every((p) => p.primaryCategory === compared[0].primaryCategory)
    ? categoryName.get(compared[0].primaryCategory) ?? null
    : null;

  return {
    kind: "ok",
    data: {
      slug: resolved.canonical,
      path,
      shareUrl: absoluteUrl(path),
      slugs,
      items,
      groups,
      isPopular: popular.some((c) => buildCompareSlug(c.slugs) === resolved.canonical),
      related,
      otherComparisons,
      versusLabel,
      title: `${versusLabel}: Compare Features and Pricing`,
      description: `${joinNames(names)} side by side${sharedCategory ? ` (${sharedCategory})` : ""}: pricing model, free plan and trial, features, deployment, platforms and integrations.`,
    },
  };
}

/** The comparison for a compare slug: its data, a redirect to the canonical slug, or invalid. */
export const getComparePage = cache(loadComparePage);

/** Editor-picked comparisons as canonical slugs, for `generateStaticParams`. */
export async function getPopularCompareSlugs(): Promise<{ slug: string }[]> {
  return (await getPopularComparisons()).map((c) => ({ slug: buildCompareSlug(c.slugs) }));
}
