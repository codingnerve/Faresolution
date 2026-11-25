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
