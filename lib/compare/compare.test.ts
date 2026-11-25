import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { features } from "@/lib/data/content/features";
import { popularComparisons } from "@/lib/data/content/comparisons";
import { products } from "@/lib/data/content/products";
import type { Product } from "@/lib/data/types";
import { buildFeatureRows, buildRows } from "./diff";
import { addToSelection, normalizeSelection, removeFromSelection } from "./selection";
import {
  MAX_COMPARE,
  buildCompareSlug,
  compareHrefWithout,
  compareHrefWith,
  parseCompareSlug,
  resolveCompareSlug,
  validateCompareSlugs,
} from "./slug";

const known = new Set(products.map((p) => p.slug));

function product(slug: string): Product {
  const found = products.find((p) => p.slug === slug);
  if (!found) throw new Error(`fixture ${slug} missing`);
  return found;
}

describe("parseCompareSlug", () => {
  it("splits on -vs-", () => {
    expect(parseCompareSlug("hubspot-crm-vs-zoho-crm")).toEqual(["hubspot-crm", "zoho-crm"]);
    expect(parseCompareSlug("asana-vs-clickup-vs-trello")).toEqual(["asana", "clickup", "trello"]);
  });

  it("keeps empty parts so malformed slugs fail validation instead of collapsing", () => {
    expect(parseCompareSlug("-vs-")).toEqual(["", ""]);
    expect(parseCompareSlug("hubspot-crm-vs-")).toEqual(["hubspot-crm", ""]);
    expect(parseCompareSlug("hubspot-crm")).toEqual(["hubspot-crm"]);
    expect(parseCompareSlug("")).toEqual([""]);
  });

  it("is safe because no product slug contains -vs- (integrity.test.ts enforces it)", () => {
    for (const p of products) expect(parseCompareSlug(p.slug)).toEqual([p.slug]);
  });
});

describe("buildCompareSlug", () => {
  it("sorts alphabetically and joins with -vs-", () => {
    expect(buildCompareSlug(["zoho-crm", "hubspot-crm"])).toBe("hubspot-crm-vs-zoho-crm");
    expect(buildCompareSlug(["trello", "asana", "clickup"])).toBe("asana-vs-clickup-vs-trello");
  });

  it("drops duplicates and does not mutate its input", () => {
    const input = ["zoho-crm", "hubspot-crm", "zoho-crm"];
    expect(buildCompareSlug(input)).toBe("hubspot-crm-vs-zoho-crm");
    expect(input).toEqual(["zoho-crm", "hubspot-crm", "zoho-crm"]);
  });

  it("round-trips with parseCompareSlug", () => {
    expect(parseCompareSlug(buildCompareSlug(["xero", "quickbooks-online"]))).toEqual(["quickbooks-online", "xero"]);
  });

  it("round-trips real product pairs to the sorted pair", () => {
    const sample = products.slice(0, 12).map((p) => p.slug);
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < sample.length; i++) for (let j = i + 1; j < sample.length; j++) pairs.push([sample[i], sample[j]]);
    for (const { slugs } of popularComparisons) for (let i = 1; i < slugs.length; i++) pairs.push([slugs[i], slugs[0]]);
    for (const [a, b] of pairs) expect(parseCompareSlug(buildCompareSlug([a, b])), `${a},${b}`).toEqual([a, b].sort());
  });

  it("matches every popular comparison (those are listed in canonical order)", () => {
    for (const { slugs } of popularComparisons) expect(parseCompareSlug(buildCompareSlug(slugs))).toEqual(slugs);
  });
});

describe("validateCompareSlugs", () => {
  it("accepts 2 to 4 unique known products, keeping their order", () => {
    expect(validateCompareSlugs(["zoho-crm", "hubspot-crm"], known)).toEqual({ ok: true, slugs: ["zoho-crm", "hubspot-crm"] });
    expect(validateCompareSlugs(["asana", "clickup", "trello", "jira"], known).ok).toBe(true);
  });

  it("rejects one product or more than four as 'count'", () => {
    expect(validateCompareSlugs(["hubspot-crm"], known)).toEqual({ ok: false, reason: "count" });
    expect(validateCompareSlugs([], known)).toEqual({ ok: false, reason: "count" });
    expect(validateCompareSlugs(["asana", "clickup", "trello", "jira", "notion"], known)).toEqual({ ok: false, reason: "count" });
  });

  it("rejects duplicates", () => {
    expect(validateCompareSlugs(["hubspot-crm", "hubspot-crm"], known)).toEqual({ ok: false, reason: "duplicate" });
    expect(validateCompareSlugs(["asana", "trello", "asana"], known)).toEqual({ ok: false, reason: "duplicate" });
  });

  it("rejects unknown, empty, differently cased and prototype-key slugs", () => {
    expect(validateCompareSlugs(["nope", "hubspot-crm"], known)).toEqual({ ok: false, reason: "unknown" });
    expect(validateCompareSlugs(["hubspot-crm", ""], known)).toEqual({ ok: false, reason: "unknown" });
    expect(validateCompareSlugs(["HubSpot-CRM", "zoho-crm"], known)).toEqual({ ok: false, reason: "unknown" });
    expect(validateCompareSlugs(["__proto__", "constructor"], known)).toEqual({ ok: false, reason: "unknown" });
  });
});

describe("resolveCompareSlug", () => {
  it("resolves a canonical slug", () => {
    expect(resolveCompareSlug("hubspot-crm-vs-zoho-crm", known)).toEqual({
      ok: true,
      slugs: ["hubspot-crm", "zoho-crm"],
      canonical: "hubspot-crm-vs-zoho-crm",
      isCanonical: true,
    });
  });

  it("flags a valid slug in non-canonical order and gives the canonical one", () => {
    expect(resolveCompareSlug("zoho-crm-vs-hubspot-crm", known)).toEqual({
      ok: true,
      slugs: ["hubspot-crm", "zoho-crm"],
      canonical: "hubspot-crm-vs-zoho-crm",
      isCanonical: false,
    });
  });

  it("rejects the Review Focus inputs", () => {
    const cases: Array<[string, string]> = [
      ["a-vs-a", "duplicate"],
      ["hubspot-crm-vs-hubspot-crm", "duplicate"],
      ["hubspot-crm", "count"],
      ["asana-vs-clickup-vs-trello-vs-jira-vs-notion", "count"],
      ["x-vs-y-vs-z-vs-w-vs-v", "count"],
      ["nope-vs-hubspot-crm", "unknown"],
      ["-vs-", "duplicate"],
      ["hubspot-crm-vs-", "unknown"],
      ["HUBSPOT-CRM-vs-ZOHO-CRM", "unknown"],
      ["hubspot-crm-VS-zoho-crm", "count"],
      ["hubspot-crm-vs-vs-zoho-crm", "unknown"],
      ["", "count"],
    ];
    for (const [slug, reason] of cases) expect(resolveCompareSlug(slug, known), slug).toEqual({ ok: false, reason });
  });
});

describe("compare hrefs", () => {
  it("removes a product, falling back to /compare below two", () => {
    expect(compareHrefWithout(["asana", "clickup", "trello"], "clickup")).toBe("/compare/asana-vs-trello");
    expect(compareHrefWithout(["hubspot-crm", "zoho-crm"], "zoho-crm")).toBe("/compare");
  });

  it("adds a product in canonical order, or null when full or already present", () => {
    expect(compareHrefWith(["zoho-crm", "hubspot-crm"], "pipedrive")).toBe("/compare/hubspot-crm-vs-pipedrive-vs-zoho-crm");
    expect(compareHrefWith(["asana", "clickup", "trello", "jira"], "notion")).toBeNull();
    expect(compareHrefWith(["asana", "trello"], "asana")).toBeNull();
  });
});

describe("buildRows", () => {
  const hubspot = product("hubspot-crm");
  const zoho = product("zoho-crm");

  it("covers every row the brief lists, one cell per product", () => {
    const rows = buildRows([hubspot, zoho]);
    const keys = rows.map((r) => r.key);
    for (const key of [
      "overview",
      "rating",
      "reviewCount",
      "pricingModel",
      "freePlan",
      "freeTrial",
      "keyFeatures",
      "deployment",
      "platforms",
      "integrations",
      "support",
      "easeOfUse",
      "valueForMoney",
    ]) {
      expect(keys, key).toContain(key);
    }
    for (const row of rows) expect(row.cells, row.key).toHaveLength(2);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("marks differs:false when every cell is equal and true otherwise", () => {
    const a: Product = { ...hubspot, deployment: ["cloud"], platforms: ["web", "ios"] };
    const b: Product = { ...zoho, deployment: ["cloud"], platforms: ["web"] };
    const rows = buildRows([a, b]);
    const row = (key: string) => rows.find((r) => r.key === key)!;
    expect(row("deployment")).toMatchObject({ cells: ["Cloud", "Cloud"], differs: false });
    expect(row("platforms").differs).toBe(true);
    expect(row("overview").differs).toBe(true);
    // Identical products never differ.
    for (const r of buildRows([hubspot, hubspot])) expect(r.differs, r.key).toBe(false);
  });

  it("says 'Not verified' for unknown facts and 'Not rated yet' for missing ratings, never null or NaN", () => {
    const unknown: Product = {
      ...hubspot,
      tagline: "",
      pricing: { model: null, freePlan: null, freeTrial: null, startingPrice: null, note: null, plans: [] },
      deployment: [],
      platforms: [],
      companySizes: [],
      featureSlugs: [],
      integrationSlugs: [],
      rating: null,
      reviewCount: 0,
    };
    const rows = buildRows([unknown, { ...unknown, rating: Number.NaN, reviewCount: Number.NaN }]);
    const row = (key: string) => rows.find((r) => r.key === key)!;
    for (const key of ["overview", "pricingModel", "startingPrice", "freePlan", "freeTrial", "keyFeatures", "deployment", "platforms", "companySize", "integrations"]) {
      expect(row(key).cells, key).toEqual(["Not verified", "Not verified"]);
    }
    for (const key of ["rating", "support", "easeOfUse", "valueForMoney"]) {
      expect(row(key).cells, key).toEqual(["Not rated yet", "Not rated yet"]);
    }
    expect(row("reviewCount").cells).toEqual(["No reviews yet", "No reviews yet"]);
    expect(JSON.stringify(rows)).not.toMatch(/null|NaN|undefined/);
  });

  it("states known facts in words", () => {
    const rows = buildRows([
      { ...hubspot, pricing: { ...hubspot.pricing, model: "freemium", freePlan: true, freeTrial: false, startingPrice: "$20/month" } },
      { ...zoho, pricing: { ...zoho.pricing, freePlan: false, freeTrial: true } },
    ]);
    const row = (key: string) => rows.find((r) => r.key === key)!;
    expect(row("pricingModel").cells[0]).toBe("Freemium");
    expect(row("startingPrice").cells[0]).toBe("$20/month");
    expect(row("freePlan").cells).toEqual(["Yes", "No"]);
    expect(row("freeTrial").cells).toEqual(["No", "Yes"]);
  });

  it("shows a rating only when backed by reviews", () => {
    const rows = buildRows([{ ...hubspot, rating: 4.36, reviewCount: 12 }, { ...zoho, rating: 4.5, reviewCount: 0 }]);
    const row = (key: string) => rows.find((r) => r.key === key)!;
    expect(row("rating").cells).toEqual(["4.4 out of 5", "Not rated yet"]);
    expect(row("reviewCount").cells).toEqual(["12 reviews", "No reviews yet"]);
  });

  it("names features and integrations from the lookups and summarises long lists", () => {
    const featureName = new Map(features.map((f) => [f.slug, f.name]));
    const a: Product = { ...hubspot, featureSlugs: ["contact-management", "pipeline-management"], integrationSlugs: ["gmail"] };
    const many: Product = { ...zoho, featureSlugs: features.slice(0, 7).map((f) => f.slug) };
    const rows = buildRows([a, many], { featureName, integrationName: new Map([["gmail", "Gmail"]]) });
    const row = (key: string) => rows.find((r) => r.key === key)!;
    expect(row("keyFeatures").cells[0]).toBe("Contact management, Pipeline management");
    expect(row("keyFeatures").cells[1]).toMatch(/ and 3 more$/);
    expect(row("integrations").cells[0]).toBe("Gmail");
  });
});

describe("buildFeatureRows", () => {
  it("lists the union of features in taxonomy order, marking which products list each", () => {
    const a: Product = { ...product("hubspot-crm"), featureSlugs: ["pipeline-management", "contact-management"] };
    const b: Product = { ...product("zoho-crm"), featureSlugs: ["contact-management", "email-campaigns"] };
    const rows = buildFeatureRows([a, b], features);
    expect(rows.map((r) => r.label)).toEqual(["Contact management", "Pipeline management", "Email campaigns"]);
    expect(rows[0]).toMatchObject({ cells: ["Listed", "Listed"], differs: false });
    expect(rows[1]).toMatchObject({ cells: ["Listed", "Not listed"], differs: true });
    expect(rows.every((r) => r.key.startsWith("feature:"))).toBe(true);
  });
});

describe("compare selection (pure)", () => {
  it("adds up to four unique known products", () => {
    let list: string[] = [];
    for (const slug of ["asana", "clickup", "trello", "jira"]) {
      const result = addToSelection(list, slug, known);
      expect(result.added, slug).toBe(true);
      list = result.list;
    }
    expect(list).toHaveLength(MAX_COMPARE);
    expect(addToSelection(list, "notion", known)).toEqual({ added: false, reason: "full", list });
    expect(addToSelection(["asana"], "asana", known)).toEqual({ added: false, reason: "duplicate", list: ["asana"] });
    expect(addToSelection([], "nope", known)).toEqual({ added: false, reason: "unknown", list: [] });
  });

  it("removes a product", () => {
    expect(removeFromSelection(["asana", "trello"], "asana")).toEqual(["trello"]);
    expect(removeFromSelection(["asana"], "nope")).toEqual(["asana"]);
  });

  it("cleans a stored list: unknown, duplicate and surplus entries are dropped", () => {
    expect(normalizeSelection(["asana", "nope", "asana", "trello", "jira", "notion", "clickup"], known)).toEqual([
      "asana",
      "trello",
      "jira",
      "notion",
    ]);
  });
});

describe("compare store (localStorage-backed)", () => {
  function createStorage() {
    const data = new Map<string, string>();
    return {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
      removeItem: (key: string) => void data.delete(key),
      clear: () => data.clear(),
      key: () => null,
      length: 0,
      data,
    };
  }

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses a fifth product and reports why", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const store = await import("./useCompare");
    for (const slug of ["asana", "clickup", "trello", "jira"]) expect(store.addToCompare(slug), slug).toBe(true);
    expect(store.addToCompare("notion")).toBe(false);
    expect(store.getCompareNotice().text).toMatch(/up to 4/);
    expect(store.readCompare()).toEqual(["asana", "clickup", "trello", "jira"]);
    expect(store.addToCompare("asana")).toBe(false);
    store.removeFromCompare("asana");
    expect(store.addToCompare("notion")).toBe(true);
    store.clearCompare();
    expect(store.readCompare()).toEqual([]);
  });

  it("keeps working in memory when storage throws", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    const store = await import("./useCompare");
    expect(store.addToCompare("asana")).toBe(true);
    expect(store.addToCompare("trello")).toBe(true);
    expect(store.readCompare()).toEqual(["asana", "trello"]);
  });

  it("ignores corrupt stored data", async () => {
    const storage = createStorage();
    storage.data.set("faresolution:compare", "{not json");
    vi.stubGlobal("localStorage", storage);
    const store = await import("./useCompare");
    expect(store.readCompare()).toEqual([]);
    expect(store.addToCompare("asana")).toBe(true);
  });
});
