import { describe, expect, it } from "vitest";
import { articles } from "./content/articles";
import { categories } from "./content/categories";
import { industries } from "./content/industries";
import { products } from "./content/products";
import type { ArticleKind } from "./types";
import {
  ARTICLE_SLUGS,
  CATEGORY_SLUGS,
  INDUSTRY_SLUGS,
  PRODUCT_SLUGS,
  articleSlugSets,
  categorySlugSet,
  industrySlugSet,
  productSlugSet,
} from "./content/slugs";

// slugs.ts is a hand-kept copy so the proxy and client code need not bundle
// the full content files. These tests catch any drift.
describe("slug lists", () => {
  it("lists every product slug, in catalogue order", () => {
    expect(PRODUCT_SLUGS).toEqual(products.map((p) => p.slug));
    expect(productSlugSet.size).toBe(products.length);
  });

  it("lists every category slug, in catalogue order", () => {
    expect(CATEGORY_SLUGS).toEqual(categories.map((c) => c.slug));
    expect(categorySlugSet.size).toBe(categories.length);
  });

  it("lists every industry slug, in catalogue order", () => {
    expect(INDUSTRY_SLUGS).toEqual(industries.map((i) => i.slug));
    expect(industrySlugSet.size).toBe(industries.length);
  });

  it("lists every article slug per kind, in content order, and nothing else", () => {
    const kinds: ArticleKind[] = ["blog", "guide", "best-software", "research", "buying-guide"];
    expect(Object.keys(ARTICLE_SLUGS).sort()).toEqual([...kinds].sort());
    for (const kind of kinds) {
      const expected = articles.filter((a) => a.kind === kind).map((a) => a.slug);
      expect(ARTICLE_SLUGS[kind], kind).toEqual(expected);
      expect(articleSlugSets[kind].size, kind).toBe(expected.length);
    }
  });
});
