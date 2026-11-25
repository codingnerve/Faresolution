import { describe, expect, it } from "vitest";
import { categories } from "./content/categories";
import { products } from "./content/products";
import { CATEGORY_SLUGS, PRODUCT_SLUGS, categorySlugSet, productSlugSet } from "./content/slugs";

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
});
