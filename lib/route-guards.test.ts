import { describe, expect, it } from "vitest";
import { config } from "@/proxy";
import { canonicalPath, guardSamplePaths, isKnownPath, matcherCovers, routeGuards, type RouteGuard } from "./route-guards";

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

describe("isKnownPath and canonicalPath: comparisons", () => {
  it("is true for 2 to 4 unique known products, canonical order or not", () => {
    expect(isKnownPath("/compare/hubspot-crm-vs-zoho-crm")).toBe(true);
    expect(isKnownPath("/compare/zoho-crm-vs-hubspot-crm")).toBe(true);
    expect(isKnownPath("/compare/asana-vs-clickup-vs-trello")).toBe(true);
    expect(isKnownPath("/compare/jira-vs-asana-vs-trello-vs-clickup")).toBe(true);
    // Valid but not an editorial pick: rendered on request.
    expect(isKnownPath("/compare/gusto-vs-xero")).toBe(true);
    expect(isKnownPath("/compare/hubspot-crm-vs-zoho-crm/")).toBe(true);
  });

  it("is false for one product, more than four, duplicates and unknown products", () => {
    for (const path of [
      "/compare/hubspot-crm",
      "/compare/a-vs-b-vs-c-vs-d-vs-e",
      "/compare/asana-vs-clickup-vs-trello-vs-jira-vs-notion",
      "/compare/hubspot-crm-vs-hubspot-crm",
      "/compare/a-vs-a",
      "/compare/nope-vs-hubspot-crm",
      "/compare/-vs-",
      "/compare/hubspot-crm-vs-",
      "/compare/HubSpot-CRM-vs-zoho-crm",
      "/compare/hubspot-crm-vs-zoho-crm/extra",
      "/compare/hubspot-crm%2F-vs-zoho-crm",
      "/compare/%E0%A4%A",
    ]) {
      expect(isKnownPath(path), path).toBe(false);
    }
  });

  it("never resolves prototype keys", () => {
    for (const key of ["__proto__", "constructor", "toString"]) {
      expect(isKnownPath(`/compare/${key}`), key).toBe(false);
      expect(isKnownPath(`/compare/${key}-vs-hubspot-crm`), key).toBe(false);
      expect(isKnownPath(`/compare/${key}-vs-${key}`), key).toBe(false);
    }
  });

  it("gives the canonical path for a valid comparison in another order", () => {
    expect(canonicalPath("/compare/zoho-crm-vs-hubspot-crm")).toBe("/compare/hubspot-crm-vs-zoho-crm");
    expect(canonicalPath("/compare/trello-vs-asana-vs-clickup")).toBe("/compare/asana-vs-clickup-vs-trello");
    expect(canonicalPath("/compare/zoho-crm-vs-hubspot-crm/")).toBe("/compare/hubspot-crm-vs-zoho-crm");
  });

  it("gives no canonical path when the path is already canonical, unknown or unguarded", () => {
    expect(canonicalPath("/compare/hubspot-crm-vs-zoho-crm")).toBeNull();
    expect(canonicalPath("/compare/hubspot-crm-vs-zoho-crm/")).toBeNull();
    expect(canonicalPath("/compare/zoho-crm-vs-nope")).toBeNull();
    expect(canonicalPath("/compare/hubspot-crm")).toBeNull();
    expect(canonicalPath("/products/hubspot-crm")).toBeNull();
    expect(canonicalPath("/software")).toBeNull();
  });
});

describe("canonicalPath: needless percent-encoding", () => {
  it("redirects an escaped spelling of a known path to the plain one", () => {
    expect(canonicalPath("/compare/hubspot-crm%2Dvs-zoho-crm")).toBe("/compare/hubspot-crm-vs-zoho-crm");
    // Escaped and out of order: one hop straight to the canonical comparison.
    expect(canonicalPath("/compare/zoho-crm%2Dvs-hubspot-crm")).toBe("/compare/hubspot-crm-vs-zoho-crm");
    expect(canonicalPath("/categories/crm%2Dsoftware")).toBe("/categories/crm-software");
    expect(canonicalPath("/products/hubspot%2Dcrm")).toBe("/products/hubspot-crm");
    expect(canonicalPath("/products/hubspot-crm/pric%69ng")).toBe("/products/hubspot-crm/pricing");
    expect(canonicalPath("/products/hubspot%2Dcrm/pricing/")).toBe("/products/hubspot-crm/pricing");
    expect(canonicalPath("/industries/real%2Destate")).toBe("/industries/real-estate");
  });

  it("leaves plain, unknown and malformed paths alone", () => {
    expect(canonicalPath("/categories/crm-software")).toBeNull();
    expect(canonicalPath("/categories/crm-software/")).toBeNull();
    expect(canonicalPath("/products/hubspot-crm/pricing")).toBeNull();
    expect(canonicalPath("/categories/nope%2Dx")).toBeNull();
    expect(canonicalPath("/categories/%E0%A4%A")).toBeNull();
    expect(canonicalPath("/categories/crm-software%2Fx")).toBeNull();
  });
});

describe("isKnownPath: alternatives", () => {
  it("is true for every kind of known product slug", () => {
    expect(isKnownPath("/alternatives/hubspot-crm")).toBe(true);
    expect(isKnownPath("/alternatives/jira")).toBe(true);
    expect(isKnownPath("/alternatives/terraform")).toBe(true);
  });

  it("is false for an unknown product", () => {
    expect(isKnownPath("/alternatives/nope")).toBe(false);
    // A category slug is not a product slug.
    expect(isKnownPath("/alternatives/crm-software")).toBe(false);
  });

  it("is false for extra segments, including a product tab", () => {
    expect(isKnownPath("/alternatives/hubspot-crm/x")).toBe(false);
    expect(isKnownPath("/alternatives/hubspot-crm/pricing")).toBe(false);
    expect(isKnownPath("/alternatives/hubspot-crm//")).toBe(false);
  });

  it("never resolves prototype keys", () => {
    for (const key of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      expect(isKnownPath(`/alternatives/${key}`), key).toBe(false);
    }
  });

  it("is false for malformed escapes and encoded slashes, and case sensitive", () => {
    expect(isKnownPath("/alternatives/%E0%A4%A")).toBe(false);
    expect(isKnownPath("/alternatives/hubspot-crm%2Fx")).toBe(false);
    expect(isKnownPath("/alternatives/HubSpot-CRM")).toBe(false);
  });

  it("decodes escapes and allows one trailing slash, like the other routes", () => {
    expect(isKnownPath("/alternatives/hubspot%2Dcrm")).toBe(true);
    expect(isKnownPath("/alternatives/hubspot-crm/")).toBe(true);
  });

  it("is unguarded for the index and has no canonical redirect", () => {
    expect(isKnownPath("/alternatives")).toBeNull();
    expect(isKnownPath("/alternatives/")).toBeNull();
    expect(canonicalPath("/alternatives/hubspot-crm")).toBeNull();
  });
});

describe("isKnownPath: review drafts", () => {
  it("is true for every kind of known product slug", () => {
    expect(isKnownPath("/reviews/write/hubspot-crm")).toBe(true);
    expect(isKnownPath("/reviews/write/jira")).toBe(true);
    expect(isKnownPath("/reviews/write/terraform")).toBe(true);
  });

  it("is false for an unknown product, and a category slug is not a product", () => {
    expect(isKnownPath("/reviews/write/nope")).toBe(false);
    expect(isKnownPath("/reviews/write/crm-software")).toBe(false);
  });

  it("is false for extra segments, including a product tab", () => {
    expect(isKnownPath("/reviews/write/hubspot-crm/x")).toBe(false);
    expect(isKnownPath("/reviews/write/hubspot-crm/reviews")).toBe(false);
    expect(isKnownPath("/reviews/write/hubspot-crm//")).toBe(false);
  });

  it("never resolves prototype keys", () => {
    for (const key of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      expect(isKnownPath(`/reviews/write/${key}`), key).toBe(false);
    }
  });

  it("is false for malformed escapes and encoded slashes, and case sensitive", () => {
    expect(isKnownPath("/reviews/write/%E0%A4%A")).toBe(false);
    expect(isKnownPath("/reviews/write/hubspot-crm%2Fx")).toBe(false);
    expect(isKnownPath("/reviews/write/HubSpot-CRM")).toBe(false);
  });

  it("decodes escapes and allows one trailing slash, like the other routes", () => {
    expect(isKnownPath("/reviews/write/hubspot%2Dcrm")).toBe(true);
    expect(isKnownPath("/reviews/write/hubspot-crm/")).toBe(true);
  });

  it("leaves the other review pages unguarded and has no canonical redirect", () => {
    for (const path of ["/reviews", "/reviews/", "/reviews/latest", "/reviews/helpful", "/reviews/write", "/reviews/write/", "/review-guidelines", "/review-verification"]) {
      expect(isKnownPath(path), path).toBeNull();
    }
    expect(canonicalPath("/reviews/write/hubspot-crm")).toBeNull();
  });
});

describe("isKnownPath: industries", () => {
  it("is true for every known industry", () => {
    expect(isKnownPath("/industries/healthcare")).toBe(true);
    expect(isKnownPath("/industries/professional-services")).toBe(true);
    expect(isKnownPath("/industries/real-estate")).toBe(true);
  });

  it("is false for an unknown industry; categories and products are not industries", () => {
    expect(isKnownPath("/industries/nope")).toBe(false);
    expect(isKnownPath("/industries/crm-software")).toBe(false);
    expect(isKnownPath("/industries/hubspot-crm")).toBe(false);
  });

  it("is false for extra segments", () => {
    expect(isKnownPath("/industries/healthcare/x")).toBe(false);
    expect(isKnownPath("/industries/nope/x")).toBe(false);
    expect(isKnownPath("/industries/healthcare//")).toBe(false);
  });

  it("never resolves prototype keys", () => {
    for (const key of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      expect(isKnownPath(`/industries/${key}`), key).toBe(false);
    }
  });

  it("is false for malformed escapes and encoded slashes, and case sensitive", () => {
    expect(isKnownPath("/industries/%E0%A4%A")).toBe(false);
    expect(isKnownPath("/industries/healthcare%2Fx")).toBe(false);
    expect(isKnownPath("/industries/Healthcare")).toBe(false);
  });

  it("decodes escapes and allows one trailing slash, like the other routes", () => {
    expect(isKnownPath("/industries/real%2Destate")).toBe(true);
    expect(isKnownPath("/industries/healthcare/")).toBe(true);
  });

  it("leaves the index unguarded and has no canonical redirect", () => {
    expect(isKnownPath("/industries")).toBeNull();
    expect(isKnownPath("/industries/")).toBeNull();
    expect(canonicalPath("/industries/healthcare")).toBeNull();
  });
});

describe("isKnownPath: editorial articles", () => {
  const known: [string, string][] = [
    ["/blog/", "five-questions-before-adding-another-saas-tool"],
    ["/blog/", "what-a-free-plan-is-really-for"],
    ["/guides/", "how-to-run-a-software-trial"],
    ["/guides/", "automate-a-business-process-without-breaking-it"],
    ["/best-software/", "crm-tools-to-shortlist-for-small-sales-teams"],
    ["/research/", "a-framework-for-scoring-software-vendors"],
    ["/research/", "how-faresolution-handles-product-facts-and-reviews"],
    ["/software-buying-guides/", "how-to-choose-accounting-software"],
    ["/software-buying-guides/", "how-to-choose-customer-support-software"],
  ];
  const prefixes = ["/blog/", "/guides/", "/best-software/", "/research/", "/software-buying-guides/"];

  it("is true for a known article of each kind under its own route", () => {
    for (const [prefix, slug] of known) expect(isKnownPath(prefix + slug), prefix + slug).toBe(true);
    expect(isKnownPath("/guides/how-to-run-a-software-trial/")).toBe(true);
    expect(isKnownPath("/guides/how%2Dto-run-a-software-trial")).toBe(true);
  });

  it("is false for an unknown slug under every prefix", () => {
    for (const prefix of prefixes) expect(isKnownPath(`${prefix}nope`), prefix).toBe(false);
  });

  it("is false for an article of another kind under the wrong prefix", () => {
    expect(isKnownPath("/guides/what-a-free-plan-is-really-for")).toBe(false);
    expect(isKnownPath("/blog/how-to-run-a-software-trial")).toBe(false);
    expect(isKnownPath("/research/how-to-choose-accounting-software")).toBe(false);
    expect(isKnownPath("/software-buying-guides/crm-tools-to-shortlist-for-small-sales-teams")).toBe(false);
    expect(isKnownPath("/best-software/a-framework-for-scoring-software-vendors")).toBe(false);
  });

  it("is false for extra segments, malformed escapes, encoded slashes and other case", () => {
    expect(isKnownPath("/research/x/y")).toBe(false);
    expect(isKnownPath("/blog/what-a-free-plan-is-really-for/extra")).toBe(false);
    expect(isKnownPath("/blog/what-a-free-plan-is-really-for//")).toBe(false);
    expect(isKnownPath("/blog/%E0%A4%A")).toBe(false);
    expect(isKnownPath("/blog/what-a-free-plan-is-really-for%2Fx")).toBe(false);
    expect(isKnownPath("/blog/What-a-free-plan-is-really-for")).toBe(false);
  });

  it("never resolves prototype keys", () => {
    for (const prefix of prefixes) {
      for (const key of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
        expect(isKnownPath(prefix + key), prefix + key).toBe(false);
      }
    }
  });

  it("leaves the index pages and the resources hub unguarded, with no canonical redirect", () => {
    for (const path of ["/blog", "/blog/", "/guides", "/best-software", "/research", "/software-buying-guides", "/resources"]) {
      expect(isKnownPath(path), path).toBeNull();
    }
    expect(canonicalPath("/blog/what-a-free-plan-is-really-for")).toBeNull();
  });
});

describe("isKnownPath: unguarded paths", () => {
  it("is null when no guard applies", () => {
    for (const path of ["/", "/software", "/categories", "/categories/", "/products", "/products/", "/software/free", "/unknown/thing", "/compare", "/compare/"]) {
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
