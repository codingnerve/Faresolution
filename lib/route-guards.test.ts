import { describe, expect, it } from "vitest";
import { config } from "@/proxy";
import { guardSamplePaths, isKnownPath, matcherCovers, routeGuards, type RouteGuard } from "./route-guards";

describe("isKnownPath: categories", () => {
  it("is true for a known slug", () => {
    expect(isKnownPath("/categories/crm-software")).toBe(true);
    expect(isKnownPath("/categories/help-desk")).toBe(true);
  });

  it("is false for an unknown slug", () => {
    expect(isKnownPath("/categories/nope")).toBe(false);
  });

  it("never resolves prototype keys", () => {
    expect(isKnownPath("/categories/__proto__")).toBe(false);
    expect(isKnownPath("/categories/constructor")).toBe(false);
    expect(isKnownPath("/categories/toString")).toBe(false);
  });

  it("is false for a malformed escape", () => {
    expect(isKnownPath("/categories/%E0%A4%A")).toBe(false);
  });

  it("is false for an encoded slash (no second segment smuggled in)", () => {
    expect(isKnownPath("/categories/a%2Fb")).toBe(false);
    expect(isKnownPath("/categories/crm-software%2Fx")).toBe(false);
  });

  it("is false for extra segments", () => {
    expect(isKnownPath("/categories/crm-software/extra")).toBe(false);
    expect(isKnownPath("/categories/x/extra")).toBe(false);
  });

  it("is case sensitive", () => {
    expect(isKnownPath("/categories/CRM-software")).toBe(false);
  });

  it("decodes escapes of a real slug", () => {
    expect(isKnownPath("/categories/crm%2Dsoftware")).toBe(true);
  });

  it("allows one trailing slash", () => {
    expect(isKnownPath("/categories/crm-software/")).toBe(true);
  });
});

describe("isKnownPath: products and their tabs", () => {
  const tabs = ["reviews", "pricing", "features", "alternatives", "integrations", "screenshots", "faq"];

  it("is true for a known product and every one of its tabs", () => {
    expect(isKnownPath("/products/hubspot-crm")).toBe(true);
    expect(isKnownPath("/products/jira")).toBe(true);
    for (const tab of tabs) expect(isKnownPath(`/products/hubspot-crm/${tab}`), tab).toBe(true);
    expect(isKnownPath("/products/hubspot-crm/pricing/")).toBe(true);
  });

  it("is false for an unknown product, with or without a tab", () => {
    expect(isKnownPath("/products/nope")).toBe(false);
    expect(isKnownPath("/products/nope/pricing")).toBe(false);
  });

  it("is false for an unknown tab of a known product", () => {
    expect(isKnownPath("/products/hubspot-crm/nope")).toBe(false);
    expect(isKnownPath("/products/hubspot-crm/Pricing")).toBe(false);
    // "overview" is the bare profile URL, not a sub-path.
    expect(isKnownPath("/products/hubspot-crm/overview")).toBe(false);
  });

  it("is false for extra segments", () => {
    expect(isKnownPath("/products/hubspot-crm/pricing/extra")).toBe(false);
    expect(isKnownPath("/products/hubspot-crm//pricing")).toBe(false);
  });

  it("never resolves prototype keys as a product or a tab", () => {
    for (const key of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      expect(isKnownPath(`/products/${key}`), key).toBe(false);
      expect(isKnownPath(`/products/hubspot-crm/${key}`), key).toBe(false);
    }
  });

  it("is false for malformed escapes and encoded slashes", () => {
    expect(isKnownPath("/products/%E0%A4%A")).toBe(false);
    expect(isKnownPath("/products/hubspot-crm/%E0%A4%A")).toBe(false);
    expect(isKnownPath("/products/hubspot-crm%2Fpricing")).toBe(false);
  });

  it("decodes escapes in the slug and the tab", () => {
    expect(isKnownPath("/products/hubspot%2Dcrm")).toBe(true);
    expect(isKnownPath("/products/hubspot-crm/pric%69ng")).toBe(true);
  });
});

describe("isKnownPath: unguarded paths", () => {
  it("is null when no guard applies", () => {
    for (const path of ["/", "/software", "/categories", "/categories/", "/products", "/products/", "/software/free", "/unknown/thing"]) {
      expect(isKnownPath(path), path).toBeNull();
    }
  });
});

describe("matcherCovers", () => {
  it("matches one segment per :param", () => {
    expect(matcherCovers(["/categories/:slug"], "/categories/x")).toBe(true);
    expect(matcherCovers(["/categories/:slug"], "/categories/x/y")).toBe(false);
    expect(matcherCovers(["/products/:slug/:tab"], "/products/x/pricing")).toBe(true);
    expect(matcherCovers(["/products/:slug/:tab"], "/products/x")).toBe(false);
  });

  it("supports the ?, * and + modifiers", () => {
    expect(matcherCovers(["/products/:slug/:tab?"], "/products/x")).toBe(true);
    expect(matcherCovers(["/products/:slug/:tab?"], "/products/x/pricing")).toBe(true);
    expect(matcherCovers(["/products/:path*"], "/products/x/pricing")).toBe(true);
    expect(matcherCovers(["/products/:path+"], "/products/x")).toBe(true);
    expect(matcherCovers(["/products/:path+"], "/products")).toBe(false);
  });

  it("matches literal segments exactly", () => {
    expect(matcherCovers(["/products/:slug/pricing"], "/products/x/pricing")).toBe(true);
    expect(matcherCovers(["/products/:slug/pricing"], "/products/x/faq")).toBe(false);
    expect(matcherCovers(["/categories/crm"], "/categories/help-desk")).toBe(false);
    expect(matcherCovers(["/products/:slug"], "/categories/x")).toBe(false);
    expect(matcherCovers([], "/categories/x")).toBe(false);
  });
});

describe("guardSamplePaths", () => {
  it("covers the bare dynamic path and each allowed sub-path", () => {
    const guard: RouteGuard = { prefix: "/p/", subpaths: ["a", "b"], exists: () => true };
    expect(guardSamplePaths(guard)).toEqual(["/p/sample", "/p/sample/a", "/p/sample/b"]);
    expect(guardSamplePaths({ prefix: "/c/", segments: 2, exists: () => true })).toEqual(["/c/sample/sample"]);
  });
});

describe("proxy matcher", () => {
  it("covers every path shape of every guard, so a new guard or tab cannot be forgotten in proxy.ts", () => {
    const matchers = (Array.isArray(config.matcher) ? config.matcher : [config.matcher]) as string[];
    for (const guard of routeGuards) {
      for (const path of guardSamplePaths(guard)) {
        expect(matcherCovers(matchers, path), path).toBe(true);
      }
    }
  });
});
