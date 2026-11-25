import { describe, expect, it } from "vitest";
import { getProducts } from "@/lib/data";
import { getProductProfile, getProductSlugs } from "./profile";
import { PRODUCT_TAB_SEGMENTS, PRODUCT_TABS, productTabFor, productTabHref } from "./tabs";

describe("getProductProfile", () => {
  it("is null for unknown slugs, prototype keys included", async () => {
    for (const slug of ["nope", "__proto__", "constructor", ""]) {
      expect(await getProductProfile(slug), slug).toBeNull();
    }
  });

  it("resolves vendor, categories (primary first), features, integrations and comparisons", async () => {
    const profile = await getProductProfile("hubspot-crm");
    expect(profile).not.toBeNull();
    const p = profile!;
    expect(p.vendor?.name).toBe("HubSpot");
    expect(p.primaryCategory?.slug).toBe("crm-software");
    expect(p.categories[0].slug).toBe("crm-software");
    expect(p.featureCount).toBe(p.product.featureSlugs.length);
    expect(p.featureGroups.every((g) => g.features.length > 0)).toBe(true);
    expect(p.integrations.map((i) => i.integration.slug)).toEqual(p.product.integrationSlugs);
    expect(p.integrations.find((i) => i.integration.slug === "slack")?.productSlug).toBe("slack");
    expect(p.integrations.find((i) => i.integration.slug === "gmail")?.productSlug).toBeNull();
    expect(p.comparisons.length).toBeGreaterThan(0);
    for (const c of p.comparisons) {
      expect(c.slugs).toContain("hubspot-crm");
      expect(c.products[0].slug).toBe("hubspot-crm");
      expect(c.products).toHaveLength(c.slugs.length);
    }
    expect(p.alternatives.map((a) => a.product.slug)).not.toContain("hubspot-crm");
  });

  it("builds a profile for every product, with no dangling references", async () => {
    for (const product of await getProducts()) {
      const p = await getProductProfile(product.slug);
      expect(p, product.slug).not.toBeNull();
      expect(p!.vendor, product.slug).not.toBeNull();
      expect(p!.primaryCategory, product.slug).not.toBeNull();
      expect(p!.categories).toHaveLength(product.categorySlugs.length);
      expect(p!.industries).toHaveLength(product.industrySlugs.length);
      expect(p!.integrations).toHaveLength(product.integrationSlugs.length);
    }
  });

  it("lists every product slug for static params", async () => {
    const slugs = (await getProductSlugs()).map((s) => s.slug);
    expect(slugs).toHaveLength((await getProducts()).length);
    expect(slugs).toContain("hubspot-crm");
  });
});

describe("product tabs", () => {
  it("has the overview plus one tab per sub-path, in order", () => {
    expect(PRODUCT_TABS[0]).toEqual({ segment: null, label: "Overview" });
    expect(PRODUCT_TABS.slice(1).map((t) => t.segment)).toEqual([...PRODUCT_TAB_SEGMENTS]);
  });

  it("builds tab URLs and falls back to the overview for unknown segments", () => {
    expect(productTabHref("jira", null)).toBe("/products/jira");
    expect(productTabHref("jira", "pricing")).toBe("/products/jira/pricing");
    expect(productTabFor("faq").label).toBe("FAQ");
    expect(productTabFor(null).label).toBe("Overview");
    expect(productTabFor("__PAGE__").label).toBe("Overview");
  });
});
