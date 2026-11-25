import { describe, expect, it } from "vitest";
import {
  getArticle,
  getArticles,
  getAuthor,
  getCategories,
  getCategory,
  getCategoryTree,
  getFeatures,
  getIndustries,
  getIndustry,
  getIntegration,
  getPopularComparisons,
  getProduct,
  getProducts,
  getProductsByCategory,
  getProductsByIndustry,
  getVendor,
} from "@/lib/data";

const LISTED_CATEGORY_SLUGS = [
  "crm-software",
  "project-management",
  "accounting-software",
  "erp-software",
  "hr-software",
  "payroll-software",
  "marketing-automation",
  "email-marketing",
  "customer-support",
  "help-desk",
  "ai-chatbots",
  "business-intelligence",
  "analytics",
  "inventory-management",
  "ecommerce",
  "website-builders",
  "cybersecurity",
  "video-conferencing",
  "document-management",
  "sales-software",
  "recruiting-software",
  "database-software",
  "collaboration-software",
  "cloud-management",
  "workflow-automation",
];

describe("unknown input", () => {
  it("returns null for unknown slugs", async () => {
    expect(await getCategory("nope")).toBeNull();
    expect(await getIndustry("nope")).toBeNull();
    expect(await getVendor("nope")).toBeNull();
    expect(await getIntegration("nope")).toBeNull();
    expect(await getProduct("nope")).toBeNull();
    expect(await getAuthor("nope")).toBeNull();
    expect(await getArticle("blog", "nope")).toBeNull();
  });

  it("returns empty lists for unknown category or industry", async () => {
    expect(await getProductsByCategory("nope")).toEqual([]);
    expect(await getProductsByIndustry("nope")).toEqual([]);
  });

  it("does not resolve inherited object keys as slugs", async () => {
    expect(await getCategory("constructor")).toBeNull();
    expect(await getVendor("__proto__")).toBeNull();
  });
});

describe("categories", () => {
  it("returns exactly the 25 listed categories", async () => {
    const slugs = (await getCategories()).map((c) => c.slug);
    expect(slugs).toHaveLength(25);
    expect(new Set(slugs)).toEqual(new Set(LISTED_CATEGORY_SLUGS));
  });

  it("nests children under their parents in the tree", async () => {
    const tree = await getCategoryTree();
    const support = tree.find((n) => n.slug === "customer-support");
    expect(support).toBeDefined();
    expect(support?.children.map((c) => c.slug).sort()).toEqual([
      "ai-chatbots",
      "help-desk",
    ]);
    const roots = tree.map((n) => n.slug);
    expect(roots).not.toContain("help-desk");
    const all = await getCategories();
    const nested = tree.flatMap((n) => [n.slug, ...n.children.map((c) => c.slug)]);
    expect(nested.sort()).toEqual(all.map((c) => c.slug).sort());
  });

  it("gives every category editorial content", async () => {
    for (const c of await getCategories()) {
      expect(c.intro.trim().length, c.slug).toBeGreaterThan(200);
      expect(c.buyingGuide.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.faq.length, c.slug).toBeGreaterThanOrEqual(4);
      expect(c.seoTitle.length, c.slug).toBeGreaterThan(10);
      expect(c.seoDescription.length, c.slug).toBeGreaterThan(40);
    }
  });

  it("only references categories that exist", async () => {
    const slugs = new Set((await getCategories()).map((c) => c.slug));
    for (const c of await getCategories()) {
      if (c.parentSlug) expect(slugs.has(c.parentSlug), c.slug).toBe(true);
      for (const r of c.relatedSlugs) {
        expect(slugs.has(r), `${c.slug} -> ${r}`).toBe(true);
        expect(r).not.toBe(c.slug);
      }
    }
  });
});

describe("industries, features, vendors, integrations", () => {
  it("returns the 12 industries", async () => {
    const industries = await getIndustries();
    expect(industries).toHaveLength(12);
    expect(new Set(industries.map((i) => i.slug)).size).toBe(12);
    const cats = new Set((await getCategories()).map((c) => c.slug));
    for (const i of industries) {
      for (const r of i.recommendedCategorySlugs) expect(cats.has(r), `${i.slug} -> ${r}`).toBe(true);
      expect(i.selectionAdvice.length, i.slug).toBeGreaterThanOrEqual(3);
    }
  });

  it("resolves known slugs", async () => {
    expect((await getIndustry("healthcare"))?.name).toBe("Healthcare");
    expect((await getVendor("hubspot"))?.name).toBe("HubSpot");
    expect((await getIntegration("slack"))?.name).toBe("Slack");
  });

  it("has a feature taxonomy with unique slugs", async () => {
    const features = await getFeatures();
    expect(features.length).toBeGreaterThanOrEqual(35);
    expect(new Set(features.map((f) => f.slug)).size).toBe(features.length);
  });

  it("uses https websites for vendors and integrations", async () => {
    for (const slug of ["hubspot", "zoho", "salesforce", "intuit"]) {
      expect((await getVendor(slug))?.website).toMatch(/^https:\/\//);
    }
  });
});

describe("content collections owned by later parts", () => {
  it("returns arrays", async () => {
    expect(Array.isArray(await getProducts())).toBe(true);
    expect(Array.isArray(await getArticles())).toBe(true);
    expect(Array.isArray(await getArticles("blog"))).toBe(true);
    expect(Array.isArray(await getPopularComparisons())).toBe(true);
  });

  it("resolves editorial authors by slug", async () => {
    expect((await getAuthor("priya-raman"))?.role).toBeTruthy();
    expect(await getAuthor("nope")).toBeNull();
  });
});

describe("products", () => {
  it("resolves the anchor CRM products", async () => {
    const hubspot = await getProduct("hubspot-crm");
    expect(hubspot?.name).toBe("HubSpot CRM");
    expect(hubspot?.vendorSlug).toBe("hubspot");
    expect((await getProduct("zoho-crm"))?.vendorSlug).toBe("zoho");
    const crm = (await getProductsByCategory("crm-software")).map((p) => p.slug);
    expect(crm).toEqual(expect.arrayContaining(["hubspot-crm", "zoho-crm"]));
  });

  it("has 55-60 products with unique, URL-safe slugs", async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThanOrEqual(55);
    expect(products.length).toBeLessThanOrEqual(60);
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) {
      expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      // "-vs-" is the compare-URL separator.
      expect(s).not.toContain("-vs-");
    }
  });

  it("only references taxonomy entries that exist", async () => {
    const categories = new Set((await getCategories()).map((c) => c.slug));
    const industries = new Set((await getIndustries()).map((i) => i.slug));
    const features = new Set((await getFeatures()).map((f) => f.slug));
    for (const p of await getProducts()) {
      expect(await getVendor(p.vendorSlug), `${p.slug} vendor`).not.toBeNull();
      expect(p.categorySlugs, p.slug).toContain(p.primaryCategory);
      for (const c of p.categorySlugs) expect(categories.has(c), `${p.slug} -> ${c}`).toBe(true);
      for (const i of p.industrySlugs) expect(industries.has(i), `${p.slug} -> ${i}`).toBe(true);
      for (const f of p.featureSlugs) expect(features.has(f), `${p.slug} -> ${f}`).toBe(true);
      for (const i of p.integrationSlugs) {
        expect(await getIntegration(i), `${p.slug} -> ${i}`).not.toBeNull();
      }
      for (const list of [p.categorySlugs, p.industrySlugs, p.featureSlugs, p.integrationSlugs]) {
        expect(new Set(list).size, p.slug).toBe(list.length);
      }
    }
  });

  it("gives every category and industry at least two products", async () => {
    for (const c of await getCategories()) {
      expect((await getProductsByCategory(c.slug)).length, c.slug).toBeGreaterThanOrEqual(2);
    }
    for (const i of await getIndustries()) {
      expect((await getProductsByIndustry(i.slug)).length, i.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("never invents ratings, reviews or verification", async () => {
    for (const p of await getProducts()) {
      expect(p.rating, p.slug).toBeNull();
      expect(p.reviewCount, p.slug).toBe(0);
      expect(p.verified, p.slug).toBe(false);
    }
  });

  it("has complete editorial fields", async () => {
    for (const p of await getProducts()) {
      expect(p.website, p.slug).toMatch(/^https:\/\//);
      expect(p.brandColor, p.slug).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.tagline.length, p.slug).toBeGreaterThan(10);
      expect(p.description.length, p.slug).toBeGreaterThan(80);
      expect(p.highlights.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(p.highlights.length, p.slug).toBeLessThanOrEqual(4);
      for (const list of [p.pros, p.cons]) {
        expect(list.length, p.slug).toBeGreaterThanOrEqual(2);
        expect(list.length, p.slug).toBeLessThanOrEqual(4);
      }
      expect(p.faq.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(p.deployment.length, p.slug).toBeGreaterThan(0);
      expect(p.platforms.length, p.slug).toBeGreaterThan(0);
      expect(p.companySizes.length, p.slug).toBeGreaterThan(0);
      expect(p.addedAt, p.slug).toMatch(/^202[56]-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(p.addedAt)), p.slug).toBe(false);
      expect(p.pricing.plans.length, p.slug).toBeGreaterThan(0);
    }
  });

  it("uses a contiguous editor-curated trending order and a curated featured set", async () => {
    const products = await getProducts();
    const ranks = products
      .map((p) => p.trendingRank)
      .filter((r): r is number => r !== null)
      .sort((a, b) => a - b);
    expect(ranks.length).toBeGreaterThanOrEqual(10);
    expect(ranks).toEqual(ranks.map((_, i) => i + 1));
    const featured = products.filter((p) => p.featured).length;
    expect(featured).toBeGreaterThanOrEqual(10);
    expect(featured).toBeLessThanOrEqual(14);
  });

  it("contains no placeholder text", async () => {
    expect(JSON.stringify(await getProducts()).toLowerCase()).not.toContain("lorem");
  });
});

describe("popular comparisons", () => {
  it("lists 8+ comparisons of 2-4 existing products in canonical order", async () => {
    const comparisons = await getPopularComparisons();
    expect(comparisons.length).toBeGreaterThanOrEqual(8);
    for (const { slugs } of comparisons) {
      expect(slugs.length).toBeGreaterThanOrEqual(2);
      expect(slugs.length).toBeLessThanOrEqual(4);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs).toEqual([...slugs].sort());
      for (const s of slugs) expect(await getProduct(s), s).not.toBeNull();
    }
    const keys = comparisons.map((c) => c.slugs.join("|"));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("hubspot-crm|zoho-crm");
  });
});

describe("content hygiene", () => {
  it("has unique slugs and no placeholder text", async () => {
    const collections = {
      categories: await getCategories(),
      industries: await getIndustries(),
      features: await getFeatures(),
    };
    for (const [name, items] of Object.entries(collections)) {
      const slugs = items.map((i) => i.slug);
      expect(new Set(slugs).size, name).toBe(slugs.length);
      expect(JSON.stringify(items).toLowerCase(), name).not.toContain("lorem");
    }
    const intros = (await getCategories()).map((c) => c.intro);
    expect(new Set(intros).size).toBe(intros.length);
  });
});
