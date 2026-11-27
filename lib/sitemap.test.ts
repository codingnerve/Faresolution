import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCompareSlug } from "@/lib/compare/slug";
import { articles } from "@/lib/data/content/articles";
import { categories } from "@/lib/data/content/categories";
import { popularComparisons } from "@/lib/data/content/comparisons";
import { industries } from "@/lib/data/content/industries";
import { products } from "@/lib/data/content/products";
import { articleHref } from "@/lib/editorial";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";
import { PRODUCT_TAB_SEGMENTS } from "@/lib/products/tabs";
import { isKnownPath } from "@/lib/route-guards";
import { SITE_URL } from "@/lib/utils";
import {
  CATALOGUE_UPDATED_AT,
  INDEXABLE_PRODUCT_TABS,
  NOINDEX_UNTIL_REVIEWS_OPEN,
  STATIC_SITEMAP_PATHS,
  buildRobots,
  buildSitemapEntries,
} from "./sitemap";

const entries = buildSitemapEntries({ products, categories, industries, articles, popularComparisons });
const urls = entries.map((e) => e.url);
const paths = urls.map((url) => url.slice(SITE_URL.length) || "/");
const has = (path: string) => paths.includes(path);

describe("buildSitemapEntries", () => {
  it("lists unique, absolute https://faresolution.org URLs without queries or fragments", () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url.startsWith(`${SITE_URL}/`), url).toBe(true);
      expect(url, url).not.toMatch(/[?#]/);
      expect(url.slice(SITE_URL.length + 1), url).not.toMatch(/\/\/|\/$/);
    }
    expect(urls).toContain(`${SITE_URL}/`);
  });

  it("includes the static sections, listing presets, indexes and company pages", () => {
    for (const path of [
      "/",
      "/software",
      "/software/trending",
      "/software/free",
      "/categories",
      "/compare",
      "/alternatives",
      "/industries",
      "/reviews",
      "/resources",
      "/blog",
      "/guides",
      "/best-software",
      "/research",
      "/software-buying-guides",
      "/vendors",
      "/vendors/pricing",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/refund-policy",
    ]) {
      expect(has(path), path).toBe(true);
    }
  });

  it("includes every product overview and its indexable tabs", () => {
    for (const p of products) {
      expect(has(`/products/${p.slug}`), p.slug).toBe(true);
      for (const tab of INDEXABLE_PRODUCT_TABS) expect(has(`/products/${p.slug}/${tab}`), `${p.slug}/${tab}`).toBe(true);
      expect(has(`/alternatives/${p.slug}`), `alternatives ${p.slug}`).toBe(true);
    }
  });

  it("includes every category, industry and article at its own route", () => {
    for (const c of categories) expect(has(`/categories/${c.slug}`), c.slug).toBe(true);
    for (const i of industries) expect(has(`/industries/${i.slug}`), i.slug).toBe(true);
    for (const a of articles) expect(has(articleHref(a.kind, a.slug)), a.slug).toBe(true);
  });

  it("includes every editor-picked comparison at its canonical URL and no other comparison", () => {
    const popular = new Set(popularComparisons.map((c) => `/compare/${buildCompareSlug(c.slugs)}`));
    for (const path of popular) expect(has(path), path).toBe(true);
    const listed = paths.filter((p) => p.startsWith("/compare/"));
    expect(new Set(listed)).toEqual(popular);
    expect(has("/compare/gusto-vs-xero")).toBe(false);
  });

  it("excludes noindex and private routes", () => {
    for (const path of ["/design", "/saved", "/reviews/write", ...NOINDEX_UNTIL_REVIEWS_OPEN]) {
      expect(has(path), path).toBe(false);
    }
    expect(paths.some((p) => p.startsWith("/reviews/write/"))).toBe(false);
    expect(paths.some((p) => /\/products\/[^/]+\/(reviews|screenshots)$/.test(p))).toBe(false);
  });

  it("marks the pages held back until reviews open as noindex, follow (R14)", async () => {
    const pages = {
      "/software/top-rated": await import("@/app/software/top-rated/page"),
      "/reviews/latest": await import("@/app/reviews/latest/page"),
      "/reviews/helpful": await import("@/app/reviews/helpful/page"),
    };
    expect(Object.keys(pages)).toEqual([...NOINDEX_UNTIL_REVIEWS_OPEN]);
    for (const [path, page] of Object.entries(pages)) {
      expect(page.metadata.robots, path).toEqual({ index: false, follow: true });
    }
    // Importing the pages transforms their component trees: slow on a cold run.
  }, 60_000);

  it("leaves out exactly the product tabs whose metadata is noindex", async () => {
    const profile = await getProductProfile(products[0].slug);
    for (const tab of PRODUCT_TAB_SEGMENTS) {
      const noindex = productTabMetadata(profile, tab).robots !== undefined;
      expect(INDEXABLE_PRODUCT_TABS.includes(tab), tab).toBe(!noindex);
    }
  });

  it("lists only routes that exist", () => {
    for (const path of STATIC_SITEMAP_PATHS) {
      const file = join(process.cwd(), "app", ...path.split("/").filter(Boolean), "page.tsx");
      expect(existsSync(file), `${path} -> ${file}`).toBe(true);
    }
    for (const path of paths) {
      if (STATIC_SITEMAP_PATHS.includes(path)) continue;
      expect(isKnownPath(path), path).toBe(true);
    }
  });

  it("dates articles by their update and everything else by the catalogue date", () => {
    for (const a of articles) {
      const entry = entries.find((e) => e.url === `${SITE_URL}${articleHref(a.kind, a.slug)}`);
      expect(entry?.lastModified, a.slug).toBe(a.updatedAt);
    }
    expect(entries.find((e) => e.url === `${SITE_URL}/products/${products[0].slug}`)?.lastModified).toBe(
      CATALOGUE_UPDATED_AT,
    );
  });
});

describe("buildRobots", () => {
  const robots = buildRobots();
  const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];

  it("allows everything for every crawler except search-result URLs", () => {
    expect(rules).toHaveLength(1);
    const [rule] = rules;
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
    // Only search results; noindex pages stay crawlable so their noindex is seen.
    expect(rule.disallow).toEqual(["/*?q=", "/*&q="]);
  });

  it("points to the absolute sitemap URL", () => {
    expect(robots.sitemap).toBe("https://faresolution.org/sitemap.xml");
  });
});
