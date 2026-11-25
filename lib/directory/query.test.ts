import { beforeAll, describe, expect, it } from "vitest";
import {
  getCategories,
  getFeatures,
  getIndustries,
  getProducts,
  getProductsInCategoryTree,
  getVendors,
} from "@/lib/data";
import type { Category, Product } from "@/lib/data";
import { buildSearchIndex, type SearchIndex } from "@/lib/search";
import {
  applyQuery,
  buildCategoryChildren,
  DEFAULT_QUERY,
  facetCounts,
  PAGE_SIZE,
  paginate,
  parseQuery,
  searchParamsToRecord,
  serializeQuery,
  type DirectoryContext,
  type DirectoryQuery,
} from "./query";

let products: Product[];
let categories: Category[];
let index: SearchIndex;
let ctx: DirectoryContext;

beforeAll(async () => {
  products = await getProducts();
  categories = await getCategories();
  index = buildSearchIndex({
    products,
    categories,
    vendors: await getVendors(),
    features: await getFeatures(),
    industries: await getIndustries(),
  });
  ctx = { searchIndex: index, categoryChildren: buildCategoryChildren(categories) };
});

function mk(slug: string, overrides: Partial<Product> = {}): Product {
  return {
    slug,
    name: slug.toUpperCase(),
    vendorSlug: `v-${slug}`,
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
    addedAt: "2025-01-01",
    featured: false,
    trendingRank: null,
    verified: false,
    brandColor: "#4169E1",
    ...overrides,
  };
}

const q = (overrides: Partial<DirectoryQuery> = {}): DirectoryQuery => ({ ...DEFAULT_QUERY, ...overrides });
const slugs = (items: { slug: string }[]) => items.map((p) => p.slug);

describe("parseQuery", () => {
  it("returns the defaults for empty input", () => {
    expect(parseQuery({})).toEqual(DEFAULT_QUERY);
    expect(DEFAULT_QUERY).toMatchObject({ q: "", sort: "relevance", page: 1, view: "grid" });
  });

  it.each([
    ["0", 1],
    ["abc", 1],
    ["-5", 1],
    ["1.5", 1],
    ["", 1],
    ["1e3", 1],
    ["2", 2],
    [" 3 ", 3],
    ["9999", 9999],
  ])("page %j -> %d", (raw, expected) => {
    expect(parseQuery({ page: raw }).page).toBe(expected);
  });

  it("caps absurdly large pages instead of overflowing", () => {
    const page = parseQuery({ page: "9".repeat(400) }).page;
    expect(Number.isSafeInteger(page)).toBe(true);
    expect(page).toBeGreaterThanOrEqual(1);
  });

  it.each(["-1", "0", "abc", "6", "NaN", "Infinity", ""])("minRating %j -> undefined", (raw) => {
    expect(parseQuery({ minRating: raw }).minRating).toBeUndefined();
  });

  it("accepts a minRating between 1 and 5", () => {
    expect(parseQuery({ minRating: "4" }).minRating).toBe(4);
    expect(parseQuery({ minRating: "3.5" }).minRating).toBe(3.5);
  });

  it("falls back to relevance for an unknown sort and grid for an unknown view", () => {
    expect(parseQuery({ sort: "popular" }).sort).toBe("relevance");
    expect(parseQuery({ sort: "constructor" }).sort).toBe("relevance");
    expect(parseQuery({ view: "table" }).view).toBe("grid");
    expect(parseQuery({ sort: "newest", view: "list" })).toMatchObject({ sort: "newest", view: "list" });
  });

  it("collapses array values to the first entry for single-valued params", () => {
    const parsed = parseQuery({ page: ["2", "5"], sort: ["name", "rating"], category: ["crm-software", "hr-software"] });
    expect(parsed.page).toBe(2);
    expect(parsed.sort).toBe("name");
    expect(parsed.category).toBe("crm-software");
  });

  it("collects repeated and comma separated features and integrations, deduplicated", () => {
    const parsed = parseQuery({ feature: ["invoicing", "dashboards,invoicing"], integration: "slack" });
    expect(parsed.feature).toEqual(["invoicing", "dashboards"]);
    expect(parsed.integration).toEqual(["slack"]);
  });

  it("ignores malformed slugs and unknown enum values", () => {
    const parsed = parseQuery({
      category: "<script>",
      priceModel: "cheap",
      companySize: "huge",
      deployment: "moon",
      industry: "Not A Slug",
      feature: ["ok-slug", "../etc", ""],
    });
    expect(parsed.category).toBeUndefined();
    expect(parsed.priceModel).toBeUndefined();
    expect(parsed.companySize).toBeUndefined();
    expect(parsed.deployment).toBeUndefined();
    expect(parsed.industry).toBeUndefined();
    expect(parsed.feature).toEqual(["ok-slug"]);
  });

  it("keeps a well-formed but unknown category slug (filtered to an empty result later)", () => {
    expect(parseQuery({ category: "no-such-category" }).category).toBe("no-such-category");
  });

  it("only turns freePlan / freeTrial on for an explicit true", () => {
    expect(parseQuery({ freePlan: "true", freeTrial: "1" })).toMatchObject({ freePlan: true, freeTrial: true });
    const off = parseQuery({ freePlan: "false", freeTrial: "yes please" });
    expect(off.freePlan).toBeUndefined();
    expect(off.freeTrial).toBeUndefined();
  });

  it("trims the text query and caps its length", () => {
    expect(parseQuery({ q: "  crm  " }).q).toBe("crm");
    expect(parseQuery({ q: "x".repeat(500) }).q.length).toBeLessThanOrEqual(100);
    expect(parseQuery({ q: ["first", "second"] }).q).toBe("first");
  });

  it("ignores undefined values and unknown keys", () => {
    expect(parseQuery({ page: undefined, utm_source: "x", __proto__: "y" } as Record<string, string | undefined>)).toEqual(
      DEFAULT_QUERY,
    );
  });
});

describe("serializeQuery", () => {
  it("omits defaults so the bare listing has no query string", () => {
    expect(serializeQuery(DEFAULT_QUERY)).toBe("");
  });

  it("writes repeated keys for multi-valued filters", () => {
    const s = serializeQuery(q({ feature: ["invoicing", "dashboards"], page: 2 }));
    expect(new URLSearchParams(s).getAll("feature")).toEqual(["invoicing", "dashboards"]);
    expect(new URLSearchParams(s).get("page")).toBe("2");
  });

  it.each<Record<string, string | string[]>>([
    {},
    { q: "help desk", category: "crm-software", page: "3" },
    { priceModel: "freemium", freePlan: "true", freeTrial: "true", minRating: "4" },
    { companySize: "small", deployment: "cloud", industry: "retail", sort: "newest", view: "list" },
    { feature: ["invoicing", "dashboards"], integration: ["slack", "zapier"], sort: "trending" },
    { q: "a&b=c?#", page: "0", sort: "bogus" },
  ])("round-trips %j", (params) => {
    const parsed = parseQuery(params);
    const again = parseQuery(searchParamsToRecord(new URLSearchParams(serializeQuery(parsed))));
    expect(again).toEqual(parsed);
    expect(serializeQuery(again)).toBe(serializeQuery(parsed));
  });
});

describe("searchParamsToRecord", () => {
  it("keeps single values as strings and repeated keys as arrays", () => {
    const record = searchParamsToRecord(new URLSearchParams("a=1&b=2&b=3"));
    expect(record).toEqual({ a: "1", b: ["2", "3"] });
  });
});

describe("applyQuery filters", () => {
  it("freeTrial:true returns only products whose freeTrial is exactly true (null excluded)", () => {
    const list = [
      mk("yes", { pricing: { ...mk("x").pricing, freeTrial: true } }),
      mk("no", { pricing: { ...mk("x").pricing, freeTrial: false } }),
      mk("unknown"),
    ];
    expect(slugs(applyQuery(list, q({ freeTrial: true }), {}))).toEqual(["yes"]);

    const real = applyQuery(products, q({ freeTrial: true }), ctx);
    expect(real.length).toBeGreaterThan(0);
    expect(real.every((p) => p.pricing.freeTrial === true)).toBe(true);
    expect(real.length).toBe(products.filter((p) => p.pricing.freeTrial === true).length);
  });

  it("freePlan:true returns only products whose freePlan is exactly true", () => {
    const real = applyQuery(products, q({ freePlan: true }), ctx);
    expect(real.length).toBe(products.filter((p) => p.pricing.freePlan === true).length);
    expect(real.every((p) => p.pricing.freePlan === true)).toBe(true);
  });

  it("category filter includes products with the category in categorySlugs", () => {
    const list = [
      mk("a", { categorySlugs: ["help-desk", "crm-software"], primaryCategory: "help-desk" }),
      mk("b", { categorySlugs: ["help-desk"] }),
    ];
    expect(slugs(applyQuery(list, q({ category: "crm-software" }), {}))).toEqual(["a"]);
  });

  it("a root category includes its children's products (R10 tree union)", async () => {
    const list = [
      mk("root-only", { categorySlugs: ["crm-software"] }),
      mk("child-only", { categorySlugs: ["sales-software"] }),
      mk("other", { categorySlugs: ["help-desk"] }),
    ];
    const children = { "crm-software": ["sales-software"] };
    expect(slugs(applyQuery(list, q({ category: "crm-software" }), { categoryChildren: children }))).toEqual([
      "child-only",
      "root-only",
    ]);
    // A child category does not pull in its parent's other products.
    expect(slugs(applyQuery(list, q({ category: "sales-software" }), { categoryChildren: children }))).toEqual([
      "child-only",
    ]);

    // Matches the data layer's tree helper on the real catalogue.
    const viaData = await getProductsInCategoryTree("crm-software");
    const viaQuery = applyQuery(products, q({ category: "crm-software" }), ctx);
    expect(new Set(slugs(viaQuery))).toEqual(new Set(slugs(viaData)));
  });

  it("an unknown category slug gives an empty result, not a throw", () => {
    expect(applyQuery(products, q({ category: "no-such-category" }), ctx)).toEqual([]);
    expect(applyQuery(products, parseQuery({ category: "constructor" }), ctx)).toEqual([]);
  });

  it("filters by price model, company size, deployment and industry", () => {
    const list = [
      mk("a", { pricing: { ...mk("x").pricing, model: "freemium" }, companySizes: ["small"], deployment: ["cloud"], industrySlugs: ["retail"] }),
      mk("b", { pricing: { ...mk("x").pricing, model: "subscription" }, companySizes: ["small"], deployment: ["cloud"], industrySlugs: ["retail"] }),
      mk("c", { pricing: { ...mk("x").pricing, model: "freemium" }, companySizes: ["enterprise"], deployment: ["cloud"], industrySlugs: ["retail"] }),
      mk("d", { pricing: { ...mk("x").pricing, model: "freemium" }, companySizes: ["small"], deployment: ["on-premise"], industrySlugs: ["retail"] }),
      mk("e", { pricing: { ...mk("x").pricing, model: "freemium" }, companySizes: ["small"], deployment: ["cloud"], industrySlugs: ["healthcare"] }),
    ];
    const result = applyQuery(
      list,
      q({ priceModel: "freemium", companySize: "small", deployment: "cloud", industry: "retail" }),
      {},
    );
    expect(slugs(result)).toEqual(["a"]);
  });

  it("requires every selected feature and integration", () => {
    const list = [
      mk("both", { featureSlugs: ["invoicing", "dashboards"], integrationSlugs: ["slack", "zapier"] }),
      mk("one", { featureSlugs: ["invoicing"], integrationSlugs: ["slack", "zapier"] }),
      mk("noint", { featureSlugs: ["invoicing", "dashboards"], integrationSlugs: ["slack"] }),
    ];
    expect(slugs(applyQuery(list, q({ feature: ["invoicing", "dashboards"] }), {}))).toEqual(["both", "noint"]);
    expect(
      slugs(applyQuery(list, q({ feature: ["invoicing", "dashboards"], integration: ["slack", "zapier"] }), {})),
    ).toEqual(["both"]);
  });

  it("minRating excludes unrated products", () => {
    const list = [mk("rated", { rating: 4.5, reviewCount: 10 }), mk("low", { rating: 3, reviewCount: 2 }), mk("none")];
    expect(slugs(applyQuery(list, q({ minRating: 4 }), {}))).toEqual(["rated"]);
  });

  it("does not mutate the input", () => {
    const copy = [...products];
    applyQuery(products, q({ sort: "newest", freePlan: true }), ctx);
    expect(products).toEqual(copy);
  });
});

describe("applyQuery text search", () => {
  it("matches product names through lib/search", () => {
    const result = applyQuery(products, q({ q: "asana" }), ctx);
    expect(result[0]?.slug).toBe("asana");
  });

  it("matches vendor names (header brand results link to /software?q=<vendor>)", async () => {
    const vendors = await getVendors();
    const atlassian = vendors.find((v) => v.slug === "atlassian");
    expect(atlassian).toBeDefined();
    const result = applyQuery(products, q({ q: atlassian!.name }), ctx);
    const expected = products.filter((p) => p.vendorSlug === "atlassian").map((p) => p.slug);
    expect(expected.length).toBeGreaterThan(1);
    for (const slug of expected) expect(slugs(result)).toContain(slug);
  });

  it("matches category, feature and industry names", () => {
    expect(applyQuery(products, q({ q: "payroll" }), ctx).length).toBeGreaterThan(0);
    expect(applyQuery(products, q({ q: "invoicing" }), ctx).length).toBeGreaterThan(0);
    expect(applyQuery(products, q({ q: "healthcare" }), ctx).length).toBeGreaterThan(0);
  });

  it("orders by search rank under relevance sort, and by the chosen sort otherwise", () => {
    const ranked = applyQuery(products, q({ q: "crm" }), ctx);
    expect(ranked.length).toBeGreaterThan(1);
    const byName = applyQuery(products, q({ q: "crm", sort: "name" }), ctx);
    expect(new Set(slugs(byName))).toEqual(new Set(slugs(ranked)));
    expect(slugs(byName)).toEqual([...byName].sort((a, b) => a.name.localeCompare(b.name, "en")).map((p) => p.slug));
  });

  it("returns a clean empty result for a query that matches nothing or is only symbols", () => {
    expect(applyQuery(products, q({ q: "zzqqxxnothing" }), ctx)).toEqual([]);
    expect(applyQuery(products, parseQuery({ q: "(([\\" }), ctx).length).toBe(products.length);
  });

  it("falls back to a plain name match without a search index", () => {
    const list = [mk("alpha", { name: "Alpha Desk" }), mk("beta", { name: "Beta" })];
    expect(slugs(applyQuery(list, q({ q: "desk" }), {}))).toEqual(["alpha"]);
  });

  it("combines text search with filters", () => {
    const result = applyQuery(products, q({ q: "crm", freePlan: true }), ctx);
    expect(result.every((p) => p.pricing.freePlan === true)).toBe(true);
  });
});

describe("applyQuery sorting", () => {
  it("relevance without a text query sorts by name", () => {
    const result = applyQuery(products, q(), ctx);
    expect(result).toHaveLength(products.length);
    expect(slugs(result)).toEqual(slugs([...products].sort((a, b) => a.name.localeCompare(b.name, "en"))));
  });

  it("newest sorts by addedAt descending", () => {
    const list = [mk("old", { addedAt: "2024-01-01" }), mk("new", { addedAt: "2025-06-01" }), mk("mid", { addedAt: "2025-01-01" })];
    expect(slugs(applyQuery(list, q({ sort: "newest" }), {}))).toEqual(["new", "mid", "old"]);
  });

  it("rating sort places null ratings last without throwing", () => {
    const list = [mk("none-a"), mk("four", { rating: 4, reviewCount: 3 }), mk("none-b"), mk("five", { rating: 5, reviewCount: 1 })];
    expect(slugs(applyQuery(list, q({ sort: "rating" }), {}))).toEqual(["five", "four", "none-a", "none-b"]);
    expect(() => applyQuery(products, q({ sort: "rating" }), ctx)).not.toThrow();
    expect(applyQuery(products, q({ sort: "rating" }), ctx)).toHaveLength(products.length);
  });

  it("trending sorts by trendingRank ascending with unranked products last", () => {
    const list = [mk("unranked"), mk("second", { trendingRank: 2 }), mk("first", { trendingRank: 1 })];
    expect(slugs(applyQuery(list, q({ sort: "trending" }), {}))).toEqual(["first", "second", "unranked"]);
  });

  it("name sort is alphabetical", () => {
    const list = [mk("b", { name: "beta" }), mk("a", { name: "Alpha" }), mk("c", { name: "Gamma" })];
    expect(slugs(applyQuery(list, q({ sort: "name" }), {}))).toEqual(["a", "b", "c"]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);

  it("uses 12 items per page by default", () => {
    expect(PAGE_SIZE).toBe(12);
    expect(paginate(items, 1)).toEqual({ items: items.slice(0, 12), page: 1, pageCount: 3, total: 30 });
    expect(paginate(items, 3).items).toEqual(items.slice(24));
  });

  it("clamps a page beyond the end to the last page", () => {
    expect(paginate(items, 9999)).toMatchObject({ page: 3, pageCount: 3, items: items.slice(24) });
  });

  it("clamps a page below 1 or not a number to the first page", () => {
    expect(paginate(items, 0).page).toBe(1);
    expect(paginate(items, -4).page).toBe(1);
    expect(paginate(items, Number.NaN).page).toBe(1);
  });

  it("gives one empty page for an empty list", () => {
    expect(paginate([], 5)).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });
});

describe("facetCounts", () => {
  it("returns every facet key", () => {
    const counts = facetCounts(products, q(), ctx);
    expect(Object.keys(counts).sort()).toEqual(
      ["category", "companySize", "deployment", "feature", "industry", "integration", "priceModel"].sort(),
    );
  });

  it("counts single-valued facets against the other filters only", () => {
    const query = q({ freePlan: true, priceModel: "freemium" });
    const counts = facetCounts(products, query, ctx);
    const subscription = counts.priceModel.find((f) => f.value === "subscription")?.count ?? 0;
    const expected = applyQuery(products, { ...query, priceModel: "subscription" }, ctx).length;
    expect(subscription).toBe(expected);
  });

  it("counts category values with the tree union", async () => {
    const counts = facetCounts(products, q(), ctx);
    const crm = counts.category.find((f) => f.value === "crm-software");
    expect(crm?.count).toBe((await getProductsInCategoryTree("crm-software")).length);
  });

  it("counts multi-valued facets as 'results if you add this value'", () => {
    const query = q({ feature: ["invoicing"] });
    const counts = facetCounts(products, query, ctx);
    const total = applyQuery(products, query, ctx).length;
    expect(counts.feature.find((f) => f.value === "invoicing")?.count).toBe(total);
    for (const f of counts.feature) {
      const expected = applyQuery(products, { ...query, feature: [...new Set(["invoicing", f.value])] }, ctx).length;
      expect(f.count).toBe(expected);
    }
  });

  it("omits zero counts but keeps a selected value", () => {
    const counts = facetCounts(products, q({ category: "no-such-category" }), ctx);
    expect(counts.category.find((f) => f.value === "no-such-category")).toEqual({ value: "no-such-category", count: 0 });
    expect(counts.priceModel.every((f) => f.count === 0)).toBe(true);
    for (const key of ["companySize", "deployment", "industry", "feature", "integration"] as const) {
      expect(counts[key].every((f) => f.count > 0)).toBe(true);
    }
  });

  it("sorts values by count, then value", () => {
    const counts = facetCounts(products, q(), ctx);
    for (const list of Object.values(counts)) {
      for (let i = 1; i < list.length; i++) {
        const [a, b] = [list[i - 1], list[i]];
        expect(a.count > b.count || (a.count === b.count && a.value <= b.value)).toBe(true);
      }
    }
  });
});
