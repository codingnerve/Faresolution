import { describe, expect, it } from "vitest";
import { getCategories, getIndustries, getProduct, getProducts, type Product } from "@/lib/data";
import { getAlternatives } from "./score";

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

const base = make("base", {
  primaryCategory: "crm",
  categorySlugs: ["crm", "sales"],
  featureSlugs: ["f1", "f2", "f3", "f4", "f5", "f6"],
  industrySlugs: ["retail"],
  deployment: ["cloud"],
  pricing: { model: "freemium", freePlan: true, freeTrial: null, startingPrice: null, note: null, plans: [] },
});
const crmA = make("crm-a", { primaryCategory: "crm", categorySlugs: ["crm"], featureSlugs: ["f1"] });
const crmB = make("crm-b", { primaryCategory: "crm", categorySlugs: ["crm", "sales"] });
// Shares no category with `base`, but everything else: if the primary-category weight were removed it would win.
const featureOnly = make("feature-only", {
  primaryCategory: "x",
  categorySlugs: ["x"],
  featureSlugs: ["f1", "f2", "f3", "f4", "f5", "f6"],
  industrySlugs: ["retail"],
  deployment: ["cloud"],
  pricing: { model: "freemium", freePlan: true, freeTrial: null, startingPrice: null, note: null, plans: [] },
});
// Padding so the base features are rare (distinctive) in this catalogue: 25 products, limit 5.
const fillers = Array.from({ length: 20 }, (_, i) => make(`filler-${i}`, { primaryCategory: `z${i}`, categorySlugs: [`z${i}`] }));
const unrelated = make("unrelated", {
  primaryCategory: "y",
  categorySlugs: ["y"],
  featureSlugs: ["f9"],
  deployment: ["cloud"],
  pricing: { model: "freemium", freePlan: true, freeTrial: null, startingPrice: null, note: null, plans: [] },
});

describe("getAlternatives", () => {
  const all = [unrelated, featureOnly, base, crmA, crmB, ...fillers];

  it("never returns the source product", () => {
    expect(getAlternatives(base, all).map((a) => a.product.slug)).not.toContain("base");
    // Even a different object with the same slug.
    expect(getAlternatives(base, [{ ...base }, crmA]).map((a) => a.product.slug)).toEqual(["crm-a"]);
  });

  it("ranks products in the same category above products that only share features", () => {
    const slugs = getAlternatives(base, all).map((a) => a.product.slug);
    expect(slugs.slice(0, 2).sort()).toEqual(["crm-a", "crm-b"]);
    expect(slugs.indexOf("feature-only")).toBeGreaterThan(1);
    // The same-category product wins on the category weight alone: the feature-only
    // product shares more of everything else (features, industry, pricing, deployment).
    const score = (slug: string) => getAlternatives(base, all).find((a) => a.product.slug === slug)!.score;
    expect(score("crm-a")).toBeGreaterThan(score("feature-only"));
  });

  it("ranks more shared categories higher, and gives scores in descending order", () => {
    const result = getAlternatives(base, all);
    expect(result[0].product.slug).toBe("crm-b");
    for (let i = 1; i < result.length; i++) expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
  });

  it("leaves out products with nothing topical in common, even if pricing and deployment match", () => {
    expect(getAlternatives(base, all).map((a) => a.product.slug)).not.toContain("unrelated");
  });

  it("respects the limit", () => {
    expect(getAlternatives(base, all, 1)).toHaveLength(1);
    expect(getAlternatives(base, all, 2)).toHaveLength(2);
    expect(getAlternatives(base, all, 0)).toEqual([]);
    expect(getAlternatives(base, all, -3)).toEqual([]);
    expect(getAlternatives(base, all)).toHaveLength(3);
    const many = Array.from({ length: 20 }, (_, i) => make(`p${i}`, { primaryCategory: "crm", categorySlugs: ["crm"] }));
    expect(getAlternatives(base, many)).toHaveLength(8);
  });

  it("scores products with unknown pricing without throwing, and does not penalise them", () => {
    const unknownPricing = make("unknown", { primaryCategory: "crm", categorySlugs: ["crm"] });
    const knownPricing = make("known", {
      primaryCategory: "crm",
      categorySlugs: ["crm"],
      pricing: { model: "subscription", freePlan: false, freeTrial: true, startingPrice: null, note: null, plans: [] },
    });
    const source = make("src", {
      primaryCategory: "crm",
      categorySlugs: ["crm"],
      pricing: { model: null, freePlan: null, freeTrial: null, startingPrice: null, note: null, plans: [] },
    });
    const result = getAlternatives(source, [unknownPricing, knownPricing]);
    expect(result).toHaveLength(2);
    expect(result[0].score).toBe(result[1].score);
    expect(result.every((a) => Number.isFinite(a.score))).toBe(true);
    expect(() => getAlternatives(unknownPricing, [base, crmA])).not.toThrow();
  });

  it("breaks ties by name, then slug", () => {
    const b = make("b", { name: "Beta", primaryCategory: "crm", categorySlugs: ["crm"] });
    const a = make("a", { name: "Alpha", primaryCategory: "crm", categorySlugs: ["crm"] });
    const c = make("c", { name: "Gamma", primaryCategory: "crm", categorySlugs: ["crm"] });
    const same = make("a2", { name: "Alpha", primaryCategory: "crm", categorySlugs: ["crm"] });
    expect(getAlternatives(base, [c, b, a, same]).map((x) => x.product.slug)).toEqual(["a", "a2", "b", "c"]);
  });

  it("gives non-empty plain-language reasons for every result", () => {
    for (const alt of getAlternatives(base, all)) {
      expect(alt.reasons.length).toBeGreaterThan(0);
      for (const reason of alt.reasons) expect(reason.trim()).not.toBe("");
    }
  });

  it("names the shared category and counts shared features in reasons", () => {
    const labels = { categories: new Map([["crm", "CRM Software"]]) };
    const [first] = getAlternatives(base, [crmA], 8, labels);
    expect(first.reasons).toContain("Same category: CRM Software");
    expect(first.reasons).toContain("1 shared feature");
    const [feat] = getAlternatives(base, [featureOnly], 8, labels);
    expect(feat.reasons).toContain("6 shared features");
  });

  it("falls back to generic wording without labels", () => {
    const [first] = getAlternatives(base, [crmA]);
    expect(first.reasons[0]).toBe("Same primary category");
  });

  it("only says 'Both free-plan products' when both are known to have a free plan", () => {
    const free = make("free", { primaryCategory: "crm", categorySlugs: ["crm"], pricing: { ...base.pricing, freePlan: true } });
    const noFree = make("no-free", { primaryCategory: "crm", categorySlugs: ["crm"], pricing: { ...base.pricing, freePlan: false } });
    const unknown = make("unk", { primaryCategory: "crm", categorySlugs: ["crm"], pricing: { ...base.pricing, freePlan: null } });
    const reasons = (p: Product) => getAlternatives(base, [p])[0].reasons;
    expect(reasons(free)).toContain("Both free-plan products");
    expect(reasons(noFree)).not.toContain("Both free-plan products");
    expect(reasons(unknown)).not.toContain("Both free-plan products");
  });

  it("is deterministic and independent of input order", () => {
    const first = getAlternatives(base, all);
    expect(getAlternatives(base, all)).toEqual(first);
    expect(getAlternatives(base, [...all].reverse())).toEqual(first);
  });

  it("never returns duplicates, even when the input repeats a product", () => {
    const result = getAlternatives(base, [crmA, crmA, { ...crmA }, crmB]);
    const slugs = result.map((a) => a.product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("getAlternatives: distinctive features", () => {
  const sourceFeatures = ["common-1", "common-2", "common-3", "common-4", "common-5", "common-6"];
  // 20 padding products all have the common features, so those are not distinctive; 24 products, limit 4.
  const padding = Array.from({ length: 20 }, (_, i) =>
    make(`pad-${i}`, { primaryCategory: `z${i}`, categorySlugs: [`z${i}`], featureSlugs: sourceFeatures }),
  );
  const source = make("source", { primaryCategory: "a", categorySlugs: ["a"], featureSlugs: [...sourceFeatures, "rare-1", "rare-2", "rare-3"] });

  it("excludes a product that shares only common features and no category", () => {
    const commonOnly = make("common-only", { primaryCategory: "b", categorySlugs: ["b"], featureSlugs: sourceFeatures });
    const slugs = getAlternatives(source, [commonOnly, ...padding], Infinity).map((a) => a.product.slug);
    expect(slugs).not.toContain("common-only");
    expect(slugs).toEqual([]);
  });

  it("includes a product that shares at least three distinctive features, without a shared category", () => {
    const twin = make("twin", { primaryCategory: "b", categorySlugs: ["b"], featureSlugs: ["rare-1", "rare-2", "rare-3", ...sourceFeatures] });
    const [first, ...rest] = getAlternatives(source, [twin, ...padding], Infinity);
    expect(rest).toEqual([]);
    expect(first.product.slug).toBe("twin");
    // Only the distinctive features are counted in the reason, not the six common ones.
    expect(first.reasons).toContain("3 shared features");
  });

  it("excludes a product that shares only two distinctive features", () => {
    const almost = make("almost", { primaryCategory: "b", categorySlugs: ["b"], featureSlugs: ["rare-1", "rare-2", ...sourceFeatures] });
    expect(getAlternatives(source, [almost, ...padding], Infinity)).toEqual([]);
  });

  it("does not count common features in the reasons of a same-category product, but still ranks on them a little", () => {
    const sameCategory = make("same-cat", { primaryCategory: "a", categorySlugs: ["a"], featureSlugs: sourceFeatures });
    const noFeatures = make("no-features", { primaryCategory: "a", categorySlugs: ["a"] });
    const result = getAlternatives(source, [noFeatures, sameCategory, ...padding], Infinity);
    expect(result.map((a) => a.product.slug)).toEqual(["same-cat", "no-features"]);
    expect(result[0].reasons.join("|")).not.toMatch(/shared feature/);
  });

  it("treats a feature that exactly two products share as distinctive in a tiny catalogue", () => {
    const a = make("a", { primaryCategory: "p", categorySlugs: ["p"], featureSlugs: ["x", "y", "z"] });
    const b = make("b", { primaryCategory: "q", categorySlugs: ["q"], featureSlugs: ["x", "y", "z"] });
    expect(getAlternatives(a, [b]).map((r) => r.product.slug)).toEqual(["b"]);
  });
});

describe("getAlternatives: reason wording", () => {
  it("says how many more shared categories there are, whether or not the primary category is shared", () => {
    const labels = { categories: new Map(["p", "q", "c1", "c2", "c3", "c4"].map((slug) => [slug, slug.toUpperCase()])) };
    const source = make("src", { primaryCategory: "p", categorySlugs: ["p", "c1", "c2", "c3", "c4"] });
    const samePrimary = make("same", { primaryCategory: "p", categorySlugs: ["p", "c1", "c2", "c3", "c4"] });
    const otherPrimary = make("other", { primaryCategory: "q", categorySlugs: ["q", "c1", "c2", "c3", "c4"] });
    expect(getAlternatives(source, [samePrimary], 8, labels)[0].reasons).toContain("Also shares: C1, C2 and 2 more");
    expect(getAlternatives(source, [otherPrimary], 8, labels)[0].reasons).toContain("Shared categories: C1, C2 and 2 more");
  });

  it("treats NaN and Infinity limits sensibly", () => {
    const a = make("a", { primaryCategory: "p", categorySlugs: ["p"] });
    const b = make("b", { primaryCategory: "p", categorySlugs: ["p"] });
    expect(getAlternatives(a, [b], Number.NaN)).toEqual([]);
    expect(getAlternatives(a, [b], Infinity)).toHaveLength(1);
  });
});

describe("getAlternatives on the real catalogue", () => {
  it("puts same-category products first for hubspot-crm", async () => {
    const [hubspot, products, categories] = await Promise.all([getProduct("hubspot-crm"), getProducts(), getCategories()]);
    const result = getAlternatives(hubspot!, products, 8, { categories: new Map(categories.map((c) => [c.slug, c.name])) });
    expect(result.length).toBeGreaterThan(1);
    expect(result[0].product.primaryCategory).toBe(hubspot!.primaryCategory);
    expect(result[0].reasons[0]).toBe("Same category: CRM Software");
    // Two or three CRMs come before anything that is not a CRM.
    expect(result.slice(0, 3).every((a) => a.product.categorySlugs.includes("crm-software"))).toBe(true);
    expect(result.map((a) => a.product.slug)).not.toContain("hubspot-crm");
  });

  it("returns at least one alternative for every product, with reasons and no duplicates", async () => {
    const [products, categories, industries] = await Promise.all([getProducts(), getCategories(), getIndustries()]);
    const labels = {
      categories: new Map(categories.map((c) => [c.slug, c.name])),
      industries: new Map(industries.map((i) => [i.slug, i.name])),
    };
    for (const product of products) {
      const result = getAlternatives(product, products, 8, labels);
      expect(result.length, product.slug).toBeGreaterThanOrEqual(1);
      expect(new Set(result.map((a) => a.product.slug)).size, product.slug).toBe(result.length);
      for (const alt of result) {
        expect(alt.product.slug).not.toBe(product.slug);
        expect(alt.score).toBeGreaterThan(0);
        expect(alt.reasons.length, `${product.slug} -> ${alt.product.slug}`).toBeGreaterThan(0);
        for (const reason of alt.reasons) expect(reason).not.toMatch(/null|undefined|NaN/);
      }
    }
  });
});
