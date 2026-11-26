import { describe, expect, it } from "vitest";
import {
  getArticles,
  getCategory,
  getIndustries,
  getProductsByIndustry,
  getProductsInCategoryTree,
  type Article,
} from "@/lib/data";
import {
  INDUSTRY_ARTICLE_LIMIT,
  INDUSTRY_PICK_LIMIT,
  getIndustryIndexData,
  getIndustryPageData,
  selectRelatedArticles,
} from "./page-data";

describe("getIndustryPageData", () => {
  it("returns null for unknown or malformed slugs", async () => {
    for (const slug of ["nope", "", "constructor", "__proto__", "Healthcare", "healthcare/x"]) {
      expect(await getIndustryPageData(slug), slug).toBeNull();
    }
  });

  it("builds a page-ready bundle for every industry", async () => {
    const industries = await getIndustries();
    expect(industries).toHaveLength(12);
    for (const i of industries) {
      const data = await getIndustryPageData(i.slug);
      expect(data, i.slug).not.toBeNull();
      expect(data!.industry.slug).toBe(i.slug);
      expect(data!.count).toBe(data!.products.length);
      expect(data!.count, `${i.slug} has products`).toBeGreaterThan(0);
      expect(data!.picks.length).toBeGreaterThan(0);
      expect(data!.picks.length).toBeLessThanOrEqual(INDUSTRY_PICK_LIMIT);
      expect(data!.categories.length).toBe(i.recommendedCategorySlugs.length);
    }
  });

  it("lists distinct products that all serve the industry, matching the data layer", async () => {
    for (const i of await getIndustries()) {
      const data = (await getIndustryPageData(i.slug))!;
      const slugs = data.products.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(data.products.every((p) => p.industrySlugs.includes(i.slug)), i.slug).toBe(true);
      expect(slugs).toEqual((await getProductsByIndustry(i.slug)).map((p) => p.slug));
      for (const p of data.picks) expect(slugs, `${i.slug}: ${p.slug}`).toContain(p.slug);
    }
  });

  it("picks featured products first, then by trending rank", async () => {
    for (const i of await getIndustries()) {
      const { picks } = (await getIndustryPageData(i.slug))!;
      const flags = picks.map((p) => p.featured);
      expect(flags, i.slug).toEqual([...flags].sort((a, b) => Number(b) - Number(a)));
      for (let n = 1; n < picks.length; n++) {
        if (picks[n - 1].featured !== picks[n].featured) continue;
        expect(picks[n - 1].trendingRank ?? Infinity, i.slug).toBeLessThanOrEqual(picks[n].trendingRank ?? Infinity);
      }
    }
  });

  it("resolves recommended categories, in the data's order, with tree-union counts (R10)", async () => {
    for (const i of await getIndustries()) {
      const data = (await getIndustryPageData(i.slug))!;
      expect(data.categories.map((c) => c.category.slug)).toEqual(i.recommendedCategorySlugs);
      for (const c of data.categories) {
        expect((await getCategory(c.category.slug))?.slug).toBe(c.category.slug);
        expect(c.count).toBe((await getProductsInCategoryTree(c.category.slug)).length);
      }
    }
  });

  it("is deterministic: two calls give the same bundle", async () => {
    for (const i of await getIndustries()) {
      const a = await getIndustryPageData(i.slug);
      const b = await getIndustryPageData(i.slug);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});

describe("selectRelatedArticles", () => {
  const make = (slug: string, kind: Article["kind"], publishedAt: string, cats: string[]): Article => ({
    kind,
    slug,
    title: slug,
    excerpt: "e",
    body: [],
    authorSlug: "a",
    categoryLabel: "x",
    publishedAt,
    updatedAt: publishedAt,
    relatedProductSlugs: [],
    relatedCategorySlugs: cats,
    featured: false,
  });

  it("keeps articles that share a category or are buying guides, newest first, ties by title", () => {
    const articles = [
      make("unrelated-blog", "blog", "2025-05-01", ["analytics"]),
      make("old-match", "guide", "2025-01-01", ["hr-software"]),
      make("any-buying-guide", "buying-guide", "2025-03-01", []),
      make("b-new-match", "blog", "2025-06-01", ["hr-software", "cybersecurity"]),
      make("a-new-match", "blog", "2025-06-01", ["cybersecurity"]),
    ];
    const picked = selectRelatedArticles(articles, ["hr-software", "cybersecurity"]);
    expect(picked.map((a) => a.slug)).toEqual(["a-new-match", "b-new-match", "any-buying-guide", "old-match"]);
  });

  it("is empty when nothing matches, and does not mutate the input", () => {
    const articles = [make("x", "blog", "2025-01-01", ["analytics"])];
    const copy = [...articles];
    expect(selectRelatedArticles(articles, ["hr-software"])).toEqual([]);
    expect(articles).toEqual(copy);
    expect(selectRelatedArticles([], ["hr-software"])).toEqual([]);
  });

  it("caps the list", () => {
    const many = Array.from({ length: INDUSTRY_ARTICLE_LIMIT + 4 }, (_, n) =>
      make(`g${n}`, "buying-guide", `2025-01-${String(n + 1).padStart(2, "0")}`, []),
    );
    expect(selectRelatedArticles(many, [])).toHaveLength(INDUSTRY_ARTICLE_LIMIT);
  });

  it("holds on the real content: every article matches the rule, newest first", async () => {
    const all = await getArticles();
    for (const i of await getIndustries()) {
      const data = (await getIndustryPageData(i.slug))!;
      const rec = new Set(i.recommendedCategorySlugs);
      for (const a of data.articles) {
        expect(a.kind === "buying-guide" || a.relatedCategorySlugs.some((s) => rec.has(s)), `${i.slug}: ${a.slug}`).toBe(true);
        expect(all.some((x) => x.kind === a.kind && x.slug === a.slug)).toBe(true);
      }
      const dates = data.articles.map((a) => a.publishedAt);
      expect(dates, i.slug).toEqual([...dates].sort().reverse());
    }
  });
});

describe("getIndustryIndexData", () => {
  it("lists every industry in catalogue order with product counts and lead categories", async () => {
    const entries = await getIndustryIndexData();
    const industries = await getIndustries();
    expect(entries.map((e) => e.industry.slug)).toEqual(industries.map((i) => i.slug));
    for (const e of entries) {
      expect(e.count).toBe((await getProductsByIndustry(e.industry.slug)).length);
      expect(e.categories.length).toBeGreaterThan(0);
      expect(e.categories.length).toBeLessThanOrEqual(3);
      expect(e.categories.map((c) => c.slug)).toEqual(e.industry.recommendedCategorySlugs.slice(0, e.categories.length));
    }
  });
});
