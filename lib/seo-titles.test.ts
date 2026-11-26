/**
 * Site-wide title rule (R13): every page title is "<page title> | Faresolution"
 * via the root template, so a page title may be at most 45 characters for the
 * rendered <title> to stay within 60. This checks every data-driven title
 * against the real catalogue: categories, industries, articles, product
 * profiles and tabs, alternatives pages and the editor-picked comparisons.
 */
import { describe, expect, it } from "vitest";
import { getAlternativesPage } from "@/lib/alternatives/page-data";
import { getComparePage } from "@/lib/compare/page-data";
import { buildCompareSlug } from "@/lib/compare/slug";
import { articles } from "@/lib/data/content/articles";
import { categories } from "@/lib/data/content/categories";
import { popularComparisons } from "@/lib/data/content/comparisons";
import { industries } from "@/lib/data/content/industries";
import { products } from "@/lib/data/content/products";
import { articleTitle } from "@/lib/editorial";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";
import { PRODUCT_TAB_SEGMENTS } from "@/lib/products/tabs";
import { MAX_TITLE_LENGTH, brandedTitle } from "./seo";

function expectFits(title: unknown, label: string) {
  expect(typeof title, label).toBe("string");
  const rendered = brandedTitle(title as string);
  expect(rendered.length, `${label}: "${rendered}"`).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
}

describe("rendered titles stay within 60 characters", () => {
  it("categories and industries", () => {
    for (const c of categories) expectFits(c.seoTitle, `category ${c.slug}`);
    for (const i of industries) expectFits(i.seoTitle, `industry ${i.slug}`);
  });

  it("articles (seoTitle, else title)", () => {
    for (const a of articles) expectFits(articleTitle(a), `article ${a.kind}/${a.slug}`);
  });

  it("names plans, not pricing, on the overview (no product has a verified price)", async () => {
    const profile = await getProductProfile("salesforce-sales-cloud");
    const title = productTabMetadata(profile, null).title as string;
    expect(title).toBe("Salesforce Sales Cloud: Features and Plans");
    expect(brandedTitle(title)).toHaveLength(57);
    expect(productTabMetadata(profile, "pricing").title).toBe("Salesforce Sales Cloud Pricing and Plans");
  });

  it("every product overview and tab", async () => {
    for (const p of products) {
      const profile = await getProductProfile(p.slug);
      for (const segment of [null, ...PRODUCT_TAB_SEGMENTS]) {
        expectFits(productTabMetadata(profile, segment).title, `product ${p.slug}/${segment ?? ""}`);
      }
    }
  });

  it("every alternatives page", async () => {
    for (const p of products) {
      const data = await getAlternativesPage(p.slug);
      expectFits(data?.title, `alternatives ${p.slug}`);
    }
  });

  it("every editor-picked comparison, except where the product names alone are too long", async () => {
    const allowed: string[] = [];
    for (const c of popularComparisons) {
      const slug = buildCompareSlug(c.slugs);
      const result = await getComparePage(slug);
      if (result.kind !== "ok") throw new Error(`${slug}: ${result.kind}`);
      const { title, versusLabel } = result.data;
      if (brandedTitle(title).length > MAX_TITLE_LENGTH) {
        // Nothing left to cut: the title is just the names.
        expect(title, slug).toBe(versusLabel);
        allowed.push(slug);
      }
    }
    // Known, accepted overflow; a new entry here means a new long comparison to review.
    expect(allowed).toEqual(["hubspot-crm-vs-pipedrive-vs-salesforce-sales-cloud"]);
  });
});
