import { describe, expect, it } from "vitest";
import { popularComparisons } from "@/lib/data/content/comparisons";
import { compareTitle, getComparePage, getPopularCompareSlugs, joinNames } from "./page-data";
import { MAX_COMPARE } from "./slug";

async function ok(slug: string) {
  const result = await getComparePage(slug);
  if (result.kind !== "ok") throw new Error(`${slug}: ${result.kind}`);
  return result.data;
}

describe("getComparePage", () => {
  it("resolves a canonical comparison with one column per product", async () => {
    const data = await ok("hubspot-crm-vs-zoho-crm");
    expect(data.items.map((i) => i.product.slug)).toEqual(["hubspot-crm", "zoho-crm"]);
    expect(data.versusLabel).toBe("HubSpot CRM vs Zoho CRM");
    expect(data.title).toBe("HubSpot CRM vs Zoho CRM Comparison");
    expect(data.path).toBe("/compare/hubspot-crm-vs-zoho-crm");
    expect(data.shareUrl).toBe("https://faresolution.com/compare/hubspot-crm-vs-zoho-crm");
    expect(data.isPopular).toBe(true);
    for (const group of data.groups) for (const row of group.rows) expect(row.cells).toHaveLength(2);
  });

  it("drops the word Comparison from titles that would not fit the 45-character budget", () => {
    expect(compareTitle("Asana vs Trello")).toBe("Asana vs Trello Comparison");
    const long = "HubSpot CRM vs Pipedrive vs Salesforce Sales Cloud";
    expect(compareTitle(long)).toBe(long);
  });

  it("asks for a redirect when the order is not canonical", async () => {
    expect(await getComparePage("zoho-crm-vs-hubspot-crm")).toEqual({ kind: "redirect", canonical: "hubspot-crm-vs-zoho-crm" });
  });

  it("is invalid for malformed, unknown, duplicate or out-of-range slugs", async () => {
    for (const slug of ["hubspot-crm", "nope-vs-hubspot-crm", "a-vs-a", "-vs-", "asana-vs-clickup-vs-trello-vs-jira-vs-notion"]) {
      expect(await getComparePage(slug), slug).toEqual({ kind: "invalid" });
    }
  });

  it("renders valid comparisons that are not editor picks, marked as such", async () => {
    const data = await ok("gusto-vs-xero");
    expect(data.isPopular).toBe(false);
  });

  it("links remove to the smaller comparison, or to /compare below two", async () => {
    expect((await ok("hubspot-crm-vs-zoho-crm")).items[0].removeHref).toBe("/compare");
    const three = await ok("asana-vs-clickup-vs-trello");
    expect(three.items.find((i) => i.product.slug === "clickup")?.removeHref).toBe("/compare/asana-vs-trello");
  });

  it("suggests alternatives outside the comparison, with add links only while there is room", async () => {
    const data = await ok("hubspot-crm-vs-zoho-crm");
    expect(data.related.length).toBeGreaterThan(0);
    for (const r of data.related) {
      expect(data.slugs).not.toContain(r.product.slug);
      expect(r.addHref).toMatch(/^\/compare\/.+-vs-.+-vs-.+$/);
    }
    const full = await ok("asana-vs-clickup-vs-jira-vs-trello");
    expect(full.slugs).toHaveLength(MAX_COMPARE);
    for (const r of full.related) expect(r.addHref).toBeNull();
  });

  it("never renders null, NaN or undefined for any popular comparison", async () => {
    for (const { slugs } of popularComparisons) {
      const data = await ok(slugs.join("-vs-"));
      const text = JSON.stringify({ groups: data.groups, title: data.title, description: data.description });
      expect(text, slugs.join(",")).not.toMatch(/null|NaN|undefined/);
      expect(data.description.length, slugs.join(",")).toBeLessThanOrEqual(200);
    }
  });
});

describe("getPopularCompareSlugs", () => {
  it("lists every popular comparison as a canonical slug", async () => {
    const params = await getPopularCompareSlugs();
    expect(params).toHaveLength(popularComparisons.length);
    expect(params).toContainEqual({ slug: "hubspot-crm-vs-zoho-crm" });
    for (const { slug } of params) expect((await getComparePage(slug)).kind, slug).toBe("ok");
  });
});

describe("joinNames", () => {
  it("joins with commas and 'and'", () => {
    expect(joinNames(["A"])).toBe("A");
    expect(joinNames(["A", "B"])).toBe("A and B");
    expect(joinNames(["A", "B", "C"])).toBe("A, B and C");
  });
});
