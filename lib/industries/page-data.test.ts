import { describe, expect, it } from "vitest";
import {
  getArticles,
  getCategories,
  getCategory,
  getIndustries,
  getProductsByIndustry,
  getProductsInCategoryTree,
  type Article,
  type Product,
} from "@/lib/data";
import {
  INDEX_CATEGORY_LIMIT,
  INDUSTRY_ARTICLE_LIMIT,
  INDUSTRY_PICK_LIMIT,
  getIndustryIndexData,
  getIndustryPageData,
  selectRelatedArticles,
} from "./page-data";

/** Recommended categories plus their direct children. */
async function recommendedTree(slugs: readonly string[]): Promise<Set<string>> {
  const all = await getCategories();
  return new Set([...slugs, ...all.filter((c) => c.parentSlug !== null && slugs.includes(c.parentSlug)).map((c) => c.slug)]);
}

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

  it("picks from the recommended categories first, each group featured first, then by trending rank", async () => {
    for (const i of await getIndustries()) {
      const { picks, products, picksInRecommended } = (await getIndustryPageData(i.slug))!;
      const tree = await recommendedTree(i.recommendedCategorySlugs);
      const inRec = (p: Product) => p.categorySlugs.some((s) => tree.has(s));
      const available = products.filter(inRec).length;
      const flags = picks.map(inRec);
      // Recommended-category products come first and fill the list when enough exist.
      expect(flags, i.slug).toEqual([...flags].sort((a, b) => Number(b) - Number(a)));
      expect(flags.filter(Boolean).length, i.slug).toBe(Math.min(available, INDUSTRY_PICK_LIMIT));
      expect(picksInRecommended, i.slug).toBe(flags.every(Boolean));
      for (const group of [picks.filter(inRec), picks.filter((p) => !inRec(p))]) {
        const featured = group.map((p) => p.featured);
        expect(featured, i.slug).toEqual([...featured].sort((a, b) => Number(b) - Number(a)));
        for (let n = 1; n < group.length; n++) {
          if (group[n - 1].featured !== group[n].featured) continue;
          expect(group[n - 1].trendingRank ?? Infinity, i.slug).toBeLessThanOrEqual(group[n].trendingRank ?? Infinity);
        }
      }
    }
  });

  it("gives healthcare picks that all sit in its recommended categories", async () => {
    const data = (await getIndustryPageData("healthcare"))!;
    const tree = await recommendedTree(data.industry.recommendedCategorySlugs);
    expect(data.picks).toHaveLength(INDUSTRY_PICK_LIMIT);
    expect(data.picksInRecommended).toBe(true);
    for (const p of data.picks) expect(p.categorySlugs.some((s) => tree.has(s)), p.slug).toBe(true);
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

  it("ranks matching articles by category overlap, then date, then title; one other buying guide fills a gap", () => {
    const articles = [
      make("unrelated-blog", "blog", "2025-05-01", ["analytics"]),
      make("old-match", "guide", "2025-01-01", ["hr-software"]),
      make("older-buying-guide", "buying-guide", "2025-02-01", []),
      make("newer-buying-guide", "buying-guide", "2025-03-01", ["analytics"]),
      make("two-overlaps", "blog", "2024-06-01", ["hr-software", "cybersecurity"]),
      make("b-new-match", "blog", "2025-06-01", ["cybersecurity"]),
      make("a-new-match", "blog", "2025-06-01", ["cybersecurity"]),
    ];
    const picked = selectRelatedArticles(articles, ["hr-software", "cybersecurity"], 5);
    expect(picked.map((a) => a.slug)).toEqual([
      "two-overlaps",
      "a-new-match",
      "b-new-match",
      "old-match",
      "newer-buying-guide",
    ]);
    // No slot left: no non-matching buying guide.
    expect(selectRelatedArticles(articles, ["hr-software", "cybersecurity"], 4).map((a) => a.slug)).toEqual([
      "two-overlaps",
      "a-new-match",
      "b-new-match",
      "old-match",
    ]);
  });

  it("adds at most one non-matching buying guide", () => {
    const articles = [
      make("g1", "buying-guide", "2025-01-01", []),
      make("g2", "buying-guide", "2025-02-01", []),
      make("g3", "buying-guide", "2025-03-01", []),
    ];
    expect(selectRelatedArticles(articles, ["hr-software"]).map((a) => a.slug)).toEqual(["g3"]);
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
      make(`a${n}`, "blog", `2025-01-${String(n + 1).padStart(2, "0")}`, ["hr-software"]),
    );
    expect(selectRelatedArticles(many, ["hr-software"])).toHaveLength(INDUSTRY_ARTICLE_LIMIT);
  });

  it("holds on the real content: matches first by overlap, at most one other buying guide", async () => {
    const all = await getArticles();
    for (const i of await getIndustries()) {
      const data = (await getIndustryPageData(i.slug))!;
      const rec = new Set(i.recommendedCategorySlugs);
      const overlap = (a: Article) => a.relatedCategorySlugs.filter((s) => rec.has(s)).length;
      const others = data.articles.filter((a) => overlap(a) === 0);
      expect(others.length, i.slug).toBeLessThanOrEqual(1);
      for (const a of others) expect(a.kind, `${i.slug}: ${a.slug}`).toBe("buying-guide");
      // Non-matching guide, if any, comes last; matches are ordered by overlap, then date.
      const matches = data.articles.filter((a) => overlap(a) > 0);
      expect(data.articles.slice(0, matches.length)).toEqual(matches);
      for (let n = 1; n < matches.length; n++) {
        const [a, b] = [matches[n - 1], matches[n]];
        expect(overlap(a) > overlap(b) || (overlap(a) === overlap(b) && a.publishedAt >= b.publishedAt), i.slug).toBe(
          true,
        );
      }
      for (const a of data.articles) expect(all.some((x) => x.kind === a.kind && x.slug === a.slug)).toBe(true);
    }
  });

  it("surfaces the accounting buying guide for finance", async () => {
    const data = (await getIndustryPageData("finance"))!;
    expect(data.articles.map((a) => a.slug)).toContain("how-to-choose-accounting-software");
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
      expect(e.categories.length).toBeLessThanOrEqual(INDEX_CATEGORY_LIMIT);
      expect(e.categories.map((c) => c.slug)).toEqual(e.industry.recommendedCategorySlugs.slice(0, e.categories.length));
    }
  });
});
