import { beforeAll, describe, expect, it } from "vitest";
import {
  getCategories,
  getFeatures,
  getIndustries,
  getProducts,
  getVendors,
} from "@/lib/data";
import type { Product } from "@/lib/data";
import { buildSearchIndex, suggestedSearches, search } from "./index";
import type { SearchIndex } from "./index";
import { levenshtein } from "./distance";

let idx: SearchIndex;
let products: Product[];

beforeAll(async () => {
  products = await getProducts();
  idx = buildSearchIndex({
    products,
    categories: await getCategories(),
    vendors: await getVendors(),
    features: await getFeatures(),
    industries: await getIndustries(),
  });
});

const slugs = (hits: { slug: string }[]) => hits.map((h) => h.slug);

function mk(slug: string, name: string): Product {
  return {
    slug,
    name,
    vendorSlug: "v-" + slug,
    tagline: "A tool",
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
    addedAt: "2026-01-01",
    featured: false,
    trendingRank: null,
    verified: false,
    brandColor: "#4169E1",
  };
}

describe("levenshtein", () => {
  it("computes edit distance", () => {
    expect(levenshtein("", "")).toBe(0);
    expect(levenshtein("abc", "abc")).toBe(0);
    expect(levenshtein("hubspt", "hubspot")).toBe(1);
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });
});

describe("search: basic matching", () => {
  it("puts hubspot-crm first for 'hubspot'", () => {
    expect(search(idx, "hubspot").products[0]?.slug).toBe("hubspot-crm");
  });

  it("is case and whitespace insensitive", () => {
    const a = search(idx, "hubspot");
    const b = search(idx, "   HubSpot  ");
    expect(slugs(b.products)).toEqual(slugs(a.products));
  });

  it("tolerates a one-character typo", () => {
    expect(slugs(search(idx, "hubspt").products)).toContain("hubspot-crm");
    expect(search(idx, "hubspt").products[0]?.slug).toBe("hubspot-crm");
  });

  it("returns the CRM category for 'crm'", () => {
    expect(slugs(search(idx, "crm").categories)).toContain("crm-software");
  });

  it("returns the vendor and its products for 'zoho'", () => {
    const r = search(idx, "zoho", { limit: 50 });
    expect(slugs(r.vendors)).toContain("zoho");
    const zohoProducts = products.filter((p) => p.vendorSlug === "zoho").map((p) => p.slug);
    expect(zohoProducts.length).toBeGreaterThan(0);
    for (const s of zohoProducts) expect(slugs(r.products)).toContain(s);
  });

  it("returns hits carrying the fields the UI needs", () => {
    const hit = search(idx, "hubspot").products[0];
    expect(hit).toMatchObject({
      slug: "hubspot-crm",
      name: "HubSpot CRM",
      vendorName: "HubSpot",
      primaryCategoryName: "CRM Software",
    });
    expect(hit.tagline.length).toBeGreaterThan(0);
    expect(hit.brandColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    const vendor = search(idx, "zoho").vendors[0];
    expect(vendor.slug).toBe("zoho");
    expect(vendor.productCount).toBe(products.filter((p) => p.vendorSlug === "zoho").length);
    const cat = search(idx, "crm").categories.find((c) => c.slug === "crm-software");
    expect(cat?.name).toBe("CRM Software");
    expect(cat?.productCount).toBe(
      products.filter((p) => p.categorySlugs.includes("crm-software")).length,
    );
  });
});

describe("search: features, industries, categories", () => {
  it("finds products by feature name ('payroll' finds Gusto and ADP)", () => {
    const found = slugs(search(idx, "payroll", { limit: 50 }).products);
    expect(found).toContain("gusto");
    expect(found).toContain("adp-workforce-now");
  });

  it("finds products by industry name", () => {
    const expected = products
      .filter((p) => p.industrySlugs.includes("healthcare"))
      .map((p) => p.slug);
    expect(expected.length).toBeGreaterThan(0);
    const found = slugs(search(idx, "healthcare", { limit: 100 }).products);
    for (const s of expected) expect(found).toContain(s);
  });

  it("finds products by a category name phrase", () => {
    const found = slugs(search(idx, "project management", { limit: 100 }).products);
    const expected = products.filter((p) => p.categorySlugs.includes("project-management"));
    expect(expected.length).toBeGreaterThan(0);
    for (const p of expected) expect(found).toContain(p.slug);
  });

  it("requires every word of a multi-word query to match", () => {
    expect(search(idx, "hubspot zzzzqqq").products).toEqual([]);
    expect(search(idx, "hubspot crm").products[0]?.slug).toBe("hubspot-crm");
  });
});

describe("search: hostile and empty input", () => {
  const empty = { products: [], categories: [], vendors: [] };

  it("returns empty results for empty and whitespace queries", () => {
    expect(search(idx, "")).toEqual(empty);
    expect(search(idx, "  ")).toEqual(empty);
    expect(search(idx, "\t\n ")).toEqual(empty);
  });

  it("does not throw on regex metacharacters", () => {
    for (const q of ["(", "[a-", "\\", ".*", "+++", "a(b", "$^", "{1,2}", "\\d+", "?"]) {
      expect(() => search(idx, q)).not.toThrow();
      expect(Array.isArray(search(idx, q).products)).toBe(true);
    }
    expect(search(idx, "(")).toEqual(empty);
    // "[a-" normalises to the single letter "a": valid hits, no error.
    const known = new Set(products.map((p) => p.slug));
    expect(() => search(idx, "[a-")).not.toThrow();
    for (const hit of search(idx, "[a-").products) expect(known.has(hit.slug)).toBe(true);
    expect(search(idx, "\\")).toEqual(empty);
  });

  it("handles very long input", () => {
    expect(search(idx, "a".repeat(600))).toEqual(empty);
    expect(() => search(idx, "crm ".repeat(300))).not.toThrow();
  });

  it("caps the query at 100 characters", () => {
    // The junk word sits past character 100 and is ignored.
    const padded = "hubspot" + " ".repeat(100) + "zzzzqqq";
    expect(slugs(search(idx, padded).products)).toContain("hubspot-crm");
    const long = "hubspot" + "x".repeat(200);
    expect(search(idx, long)).toEqual(search(idx, long.slice(0, 100)));
  });

  it("returns nothing for gibberish", () => {
    expect(search(idx, "zzzzqqq")).toEqual(empty);
  });

  it("treats inherited object keys as plain text", () => {
    const known = new Set(products.map((p) => p.slug));
    // "__proto__" normalises to "proto", which matches nothing.
    expect(search(idx, "__proto__")).toEqual(empty);
    for (const q of ["constructor", "toString", "hasOwnProperty"]) {
      const r = search(idx, q, { limit: 100 });
      for (const hit of r.products) expect(known.has(hit.slug)).toBe(true);
    }
  });
});

describe("search: very short tokens", () => {
  const pos = (hits: { slug: string }[], slug: string) => {
    const i = slugs(hits).indexOf(slug);
    return i === -1 ? Infinity : i;
  };

  it("'cr' ranks CRM products ahead of CrowdStrike (or drops it)", () => {
    const r = search(idx, "cr", { limit: 100 }).products;
    const crm = Math.min(pos(r, "zoho-crm"), pos(r, "hubspot-crm"));
    expect(crm).toBeLessThan(Infinity);
    expect(crm).toBeLessThan(pos(r, "crowdstrike-falcon"));
  });

  it("'hr' returns HR products at the top and not CrowdStrike", () => {
    const r = search(idx, "hr").products;
    const hrProducts = new Set(
      products.filter((p) => p.categorySlugs.includes("hr-software")).map((p) => p.slug),
    );
    expect(hrProducts.size).toBeGreaterThan(0);
    for (const hit of r.slice(0, 3)) expect(hrProducts.has(hit.slug)).toBe(true);
    expect(slugs(search(idx, "hr", { limit: 100 }).products)).not.toContain("crowdstrike-falcon");
  });

  it("does not match 1-2 letter tokens inside words or taglines", () => {
    const small = buildSearchIndex({
      products: [{ ...mk("a", "Alpha"), tagline: "Handles payroll" }],
      categories: [],
      vendors: [],
      features: [],
      industries: [],
    });
    expect(search(small, "ro").products).toEqual([]); // inside "payroll"
    expect(search(small, "pa").products).toEqual([]); // tagline word prefix, 2 letters
    expect(slugs(search(small, "pay").products)).toEqual(["a"]); // 3 letters: tagline word prefix
    expect(slugs(search(small, "al").products)).toEqual(["a"]); // name prefix still works
  });
});

describe("search: limit and uniqueness", () => {
  it("respects the limit per group", () => {
    const r = search(idx, "crm", { limit: 3 });
    expect(r.products.length).toBeLessThanOrEqual(3);
    expect(r.categories.length).toBeLessThanOrEqual(3);
    expect(r.vendors.length).toBeLessThanOrEqual(3);
    expect(search(idx, "crm", { limit: 1 }).products).toHaveLength(1);
  });

  it("uses a sensible default limit and ignores a non-positive limit", () => {
    const r = search(idx, "software");
    expect(r.products.length).toBeGreaterThan(0);
    expect(r.products.length).toBeLessThanOrEqual(8);
    expect(search(idx, "crm", { limit: 0 }).products.length).toBeGreaterThan(0);
    expect(search(idx, "crm", { limit: Number.NaN }).products.length).toBeGreaterThan(0);
  });

  it("never returns duplicate hits", () => {
    for (const q of ["crm", "hubspot", "zoho", "payroll", "software", "management", "marketing"]) {
      const r = search(idx, q, { limit: 100 });
      expect(new Set(slugs(r.products)).size).toBe(r.products.length);
      expect(new Set(slugs(r.categories)).size).toBe(r.categories.length);
      expect(new Set(slugs(r.vendors)).size).toBe(r.vendors.length);
    }
  });

  it("does not duplicate products when the input list repeats a slug", () => {
    const small = buildSearchIndex({
      products: [mk("dup", "Dupe Tool"), mk("dup", "Dupe Tool")],
      categories: [],
      vendors: [],
      features: [],
      industries: [],
    });
    expect(search(small, "dupe").products).toHaveLength(1);
  });
});

describe("search: ranking", () => {
  it("prefers name prefix over word prefix over substring over fuzzy", () => {
    const small = buildSearchIndex({
      products: [
        mk("p-fuzzy", "Alphx Tool"),
        mk("p-sub", "Realpha Suite"),
        mk("p-word", "The Alpha Suite"),
        mk("p-prefix", "Alpha Desk"),
      ],
      categories: [],
      vendors: [],
      features: [],
      industries: [],
    });
    expect(slugs(search(small, "alpha").products)).toEqual([
      "p-prefix",
      "p-word",
      "p-sub",
      "p-fuzzy",
    ]);
  });

  it("ranks an exact name above a prefix match", () => {
    const small = buildSearchIndex({
      products: [mk("long", "Slackware Pro"), mk("exact", "Slack")],
      categories: [],
      vendors: [],
      features: [],
      industries: [],
    });
    expect(search(small, "slack").products[0].slug).toBe("exact");
  });

  it("applies typo tolerance only to tokens of 4 or more characters", () => {
    const small = buildSearchIndex({
      products: [mk("a", "Zap"), mk("b", "Odoo")],
      categories: [],
      vendors: [],
      features: [],
      industries: [],
    });
    expect(search(small, "zep").products).toEqual([]); // 3 chars: no fuzzy
    expect(slugs(search(small, "odoa").products)).toEqual(["b"]); // 4 chars, distance 1
  });

  it("allows distance 1 for length 4-6 and 2 above 6", () => {
    const small = buildSearchIndex({
      products: [mk("a", "Salesforce"), mk("b", "Asana")],
      categories: [],
      vendors: [],
      features: [],
      industries: [],
    });
    expect(search(small, "asnaa").products).toEqual([]); // distance 2, length 5
    expect(slugs(search(small, "asanna").products)).toContain("b"); // distance 1
    expect(slugs(search(small, "salesfroce").products)).toContain("a"); // distance 2, length 10
    expect(search(small, "slsfrce").products).toEqual([]); // distance 3
  });
});

describe("serialisation", () => {
  it("survives a JSON round trip and searches identically", () => {
    const copy = JSON.parse(JSON.stringify(idx)) as SearchIndex;
    for (const q of ["hubspot", "hubspt", "crm", "zoho", "payroll", "healthcare", "(", ""]) {
      expect(search(copy, q, { limit: 20 })).toEqual(search(idx, q, { limit: 20 }));
    }
  });

  it("stays compact (no long descriptions)", () => {
    const json = JSON.stringify(idx);
    expect(json).not.toContain(products[0].description);
    expect(json.length).toBeLessThan(150_000);
  });
});

describe("suggestedSearches", () => {
  it("is a static list of 8 distinct terms that each return products", () => {
    expect(suggestedSearches).toHaveLength(8);
    expect(new Set(suggestedSearches).size).toBe(8);
    for (const term of suggestedSearches) {
      expect(search(idx, term).products.length, `suggested search "${term}"`).toBeGreaterThan(0);
    }
  });
});
