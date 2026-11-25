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
import type { ArticleKind } from "@/lib/data";

// Content integrity (uniqueness, cross references, honesty fields, SEO limits)
// lives in integrity.test.ts. This file covers accessor behaviour only.

const ARTICLE_KINDS: ArticleKind[] = ["blog", "guide", "best-software", "research", "buying-guide"];

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
    expect(await getProduct("toString")).toBeNull();
    expect(await getArticle("guide", "constructor")).toBeNull();
  });
});

describe("list accessors", () => {
  it("return a fresh outer array on every call (copy-on-return)", async () => {
    const lists = [
      [await getProducts(), await getProducts()],
      [await getCategories(), await getCategories()],
      [await getIndustries(), await getIndustries()],
      [await getFeatures(), await getFeatures()],
      [await getArticles(), await getArticles()],
      [await getPopularComparisons(), await getPopularComparisons()],
    ] as const;
    for (const [a, b] of lists) {
      expect(a.length).toBeGreaterThan(0);
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    }
  });

  it("is not affected by a caller reordering or emptying a returned list", async () => {
    const before = (await getProducts()).map((p) => p.slug);
    const list = await getProducts();
    list.reverse();
    list.length = 0;
    expect((await getProducts()).map((p) => p.slug)).toEqual(before);
  });
});

describe("categories", () => {
  it("looks up a category by slug", async () => {
    const crm = await getCategory("crm-software");
    expect(crm?.name).toBe("CRM Software");
    expect(crm?.parentSlug).toBeNull();
    expect((await getCategory("help-desk"))?.parentSlug).toBe("customer-support");
  });

  it("nests children under their parents in the tree", async () => {
    const tree = await getCategoryTree();
    const support = tree.find((n) => n.slug === "customer-support");
    expect(support?.children.map((c) => c.slug).sort()).toEqual(["ai-chatbots", "help-desk"]);
    expect(tree.map((n) => n.slug)).not.toContain("help-desk");
    for (const node of tree) {
      expect(node.parentSlug).toBeNull();
      for (const child of node.children) expect(child.parentSlug).toBe(node.slug);
    }
    const all = await getCategories();
    const nested = tree.flatMap((n) => [n.slug, ...n.children.map((c) => c.slug)]);
    expect(nested.sort()).toEqual(all.map((c) => c.slug).sort());
  });
});

describe("taxonomy lookups", () => {
  it("resolves known industries, vendors and integrations", async () => {
    expect((await getIndustry("healthcare"))?.name).toBe("Healthcare");
    expect((await getVendor("hubspot"))?.name).toBe("HubSpot");
    expect((await getIntegration("slack"))?.name).toBe("Slack");
  });
});

describe("products", () => {
  it("resolves a product with its vendor", async () => {
    const hubspot = await getProduct("hubspot-crm");
    expect(hubspot?.name).toBe("HubSpot CRM");
    expect(hubspot?.vendorSlug).toBe("hubspot");
    expect((await getVendor(hubspot?.vendorSlug ?? ""))?.name).toBe("HubSpot");
    expect((await getProduct("zoho-crm"))?.vendorSlug).toBe("zoho");
  });

  it("returns products for a category, matching on direct tags only", async () => {
    const crm = await getProductsByCategory("crm-software");
    expect(crm.map((p) => p.slug)).toEqual(expect.arrayContaining(["hubspot-crm", "zoho-crm"]));
    for (const p of crm) expect(p.categorySlugs).toContain("crm-software");
    const slugs = await getProductsByCategory("workflow-automation");
    expect(slugs.map((p) => p.slug)).toEqual(expect.arrayContaining(["make", "n8n", "zapier"]));
  });

  it("returns products for an industry", async () => {
    const healthcare = await getProductsByIndustry("healthcare");
    expect(healthcare.length).toBeGreaterThanOrEqual(2);
    for (const p of healthcare) expect(p.industrySlugs).toContain("healthcare");
  });
});

describe("authors", () => {
  it("resolves editorial authors by slug", async () => {
    const author = await getAuthor("priya-raman");
    expect(author?.name).toBe("Priya Raman");
    expect(author?.role.length).toBeGreaterThan(0);
  });
});

describe("articles", () => {
  it("filters by kind", async () => {
    const all = await getArticles();
    for (const kind of ARTICLE_KINDS) {
      const ofKind = await getArticles(kind);
      expect(ofKind.length, kind).toBeGreaterThan(0);
      expect(ofKind.every((a) => a.kind === kind), kind).toBe(true);
    }
    const total = (await Promise.all(ARTICLE_KINDS.map((k) => getArticles(k)))).flat();
    expect(total).toHaveLength(all.length);
  });

  it("returns an empty list for an unknown kind", async () => {
    expect(await getArticles("nope" as ArticleKind)).toEqual([]);
  });

  it("looks up an article by kind and slug", async () => {
    const trial = await getArticle("guide", "how-to-run-a-software-trial");
    expect(trial?.title).toContain("software trial");
    expect(trial?.kind).toBe("guide");
    expect((await getAuthor(trial?.authorSlug ?? ""))?.name).toBeTruthy();
  });

  it("does not resolve an article under the wrong kind", async () => {
    expect(await getArticle("blog", "how-to-run-a-software-trial")).toBeNull();
  });
});
