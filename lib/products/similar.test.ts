import { describe, expect, it } from "vitest";
import { getProduct, getProducts, type Product } from "@/lib/data";
import { similarProducts } from "./similar";

function make(slug: string, overrides: Partial<Product> = {}): Product {
  return {
    slug,
    name: slug.toUpperCase(),
    vendorSlug: "v",
    tagline: "",
    description: "",
    website: "https://example.com",
    categorySlugs: [],
    primaryCategory: "none",
    industrySlugs: [],
    featureSlugs: [],
    integrationSlugs: [],
    pricing: { model: null, freePlan: null, freeTrial: null, startingPrice: null, note: null, plans: [] },
    deployment: [],
    platforms: [],
    companySizes: [],
    highlights: [],
    pros: [],
    cons: [],
    faq: [],
    rating: null,
    reviewCount: 0,
    addedAt: "2025-01-01",
    featured: false,
    trendingRank: null,
    verified: false,
    brandColor: "#17243A",
    ...overrides,
  };
}

describe("similarProducts", () => {
  const base = make("base", { primaryCategory: "crm", categorySlugs: ["crm", "sales"], featureSlugs: ["f1", "f2"] });
  const samePrimary = make("same-primary", { primaryCategory: "crm", categorySlugs: ["crm"] });
  const sharedCategory = make("shared-category", { primaryCategory: "sales", categorySlugs: ["sales"] });
  const sharedFeatures = make("shared-features", { primaryCategory: "x", categorySlugs: ["x"], featureSlugs: ["f1", "f2"] });
  const unrelated = make("unrelated", { primaryCategory: "y", categorySlugs: ["y"], featureSlugs: ["f9"] });
  const all = [unrelated, sharedFeatures, base, sharedCategory, samePrimary];

  it("never includes the product itself or unrelated products", () => {
    const slugs = similarProducts(base, all).map((p) => p.slug);
    expect(slugs).not.toContain("base");
    expect(slugs).not.toContain("unrelated");
  });

  it("ranks the same primary category above shared categories, and those above shared features", () => {
    expect(similarProducts(base, all).map((p) => p.slug)).toEqual([
      "same-primary",
      "shared-category",
      "shared-features",
    ]);
  });

  it("respects the limit", () => {
    expect(similarProducts(base, all, 1).map((p) => p.slug)).toEqual(["same-primary"]);
    expect(similarProducts(base, all, 0)).toEqual([]);
  });

  it("breaks ties by editorial pick, then trending order, then name", () => {
    const a = make("a", { primaryCategory: "crm", categorySlugs: ["crm"], name: "Alpha" });
    const b = make("b", { primaryCategory: "crm", categorySlugs: ["crm"], name: "Beta", trendingRank: 3 });
    const c = make("c", { primaryCategory: "crm", categorySlugs: ["crm"], name: "Gamma", featured: true });
    expect(similarProducts(base, [a, b, c, base]).map((p) => p.slug)).toEqual(["c", "b", "a"]);
  });

  it("finds same-category products for real catalogue entries", async () => {
    const hubspot = await getProduct("hubspot-crm");
    const result = similarProducts(hubspot!, await getProducts());
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].categorySlugs).toContain("crm-software");
    expect(new Set(result.map((p) => p.slug)).size).toBe(result.length);
  });
});
