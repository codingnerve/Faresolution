/**
 * What crawlers are offered: the sitemap entries and robots rules. Pure
 * functions over the content (`app/sitemap.ts` and `app/robots.ts` feed them
 * from the data layer), so `sitemap.test.ts` can check them against the real
 * catalogue and the route guards.
 *
 * The sitemap lists every indexable page and nothing else: no noindex pages
 * (product reviews and screenshots tabs while empty, comparisons that are not
 * editor picks, review draft forms, /design), no /saved, and no query URLs.
 * Listing pages beyond the first canonicalise to the bare path, so every
 * product, category, industry and article is listed directly.
 */
import type { MetadataRoute } from "next";
import { buildCompareSlug } from "@/lib/compare/slug";
import type { ArticleKind, PopularComparison } from "@/lib/data/types";
import { ARTICLE_KINDS, articleHref, articleIndexHref } from "@/lib/editorial";
import { NOINDEX_PRODUCT_TABS } from "@/lib/products/metadata";
import { PRODUCT_TAB_SEGMENTS, productTabHref, type ProductTabSegment } from "@/lib/products/tabs";
import { siteUrl } from "@/lib/seo";

/**
 * Date of the last catalogue content update (products, categories,
 * industries, comparisons and static pages), used as lastModified for every
 * URL that has no date of its own. Articles carry their own `updatedAt`.
 * Bump it when the catalogue content changes.
 */
export const CATALOGUE_UPDATED_AT = "2026-11-25";

/** Indexable static pages (each has an `app/<path>/page.tsx`; the test checks). */
export const STATIC_SITEMAP_PATHS: readonly string[] = [
  "/",
  // Directory and listing presets
  "/software",
  "/software/trending",
  "/software/new",
  "/software/free",
  "/software/top-rated",
  // Section indexes
  "/categories",
  "/industries",
  "/compare",
  "/alternatives",
  // Reviews
  "/reviews",
  "/reviews/latest",
  "/reviews/helpful",
  "/review-guidelines",
  "/review-verification",
  // Editorial
  "/resources",
  ...ARTICLE_KINDS.map((kind) => articleIndexHref[kind]),
  // Vendors
  "/vendors",
  "/vendors/register",
  "/vendors/claim-listing",
  "/vendors/pricing",
  "/vendors/resources",
  "/vendors/success-stories",
  // Company
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

/** Product tabs offered to search engines (the rest are noindex while they have no content). */
export const INDEXABLE_PRODUCT_TABS: readonly ProductTabSegment[] = PRODUCT_TAB_SEGMENTS.filter(
  (tab) => !NOINDEX_PRODUCT_TABS.has(tab),
);

export interface SitemapInput {
  products: readonly { slug: string }[];
  categories: readonly { slug: string }[];
  industries: readonly { slug: string }[];
  articles: readonly { kind: ArticleKind; slug: string; updatedAt: string }[];
  popularComparisons: readonly PopularComparison[];
}

/** Every indexable URL, absolute and unique, in a stable order. */
export function buildSitemapEntries(input: SitemapInput): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const add = (path: string, lastModified: string = CATALOGUE_UPDATED_AT) => {
    const url = siteUrl(path);
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({ url, lastModified });
  };

  STATIC_SITEMAP_PATHS.forEach((path) => add(path));
  for (const { slug } of input.products) {
    add(productTabHref(slug, null));
    for (const tab of INDEXABLE_PRODUCT_TABS) add(productTabHref(slug, tab));
  }
  for (const { slug } of input.products) add(`/alternatives/${slug}`);
  for (const { slug } of input.categories) add(`/categories/${slug}`);
  for (const { slug } of input.industries) add(`/industries/${slug}`);
  for (const article of input.articles) add(articleHref(article.kind, article.slug), article.updatedAt);
  // Editor picks only, at their canonical (sorted) slug; other combinations are noindex.
  for (const { slugs } of input.popularComparisons) add(`/compare/${buildCompareSlug(slugs)}`);
  return entries;
}

/**
 * Crawl rules: everything is allowed except the internal design page, the
 * visitor's saved items, the review draft forms (noindex) and on-site search
 * results (`?q=` anywhere in the query string; Google and Bing support `*`).
 */
export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/design", "/saved", "/reviews/write/", "/*?q=", "/*&q="],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
