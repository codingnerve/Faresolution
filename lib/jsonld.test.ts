import { describe, expect, it } from "vitest";
import { organizationJsonLd, safeJsonLd } from "@/lib/jsonld";

describe("safeJsonLd", () => {
  it("escapes < so text can never close the script tag", () => {
    const out = safeJsonLd({ name: "</script><b>bold</b>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("still parses back to the original value", () => {
    const value = { name: "a < b", nested: ["<tag>", 1, null] };
    expect(JSON.parse(safeJsonLd(value))).toEqual(value);
  });
});

describe("organizationJsonLd", () => {
  const graph = organizationJsonLd() as {
    "@context": string;
    "@graph": Record<string, unknown>[];
  };
  const byType = (type: string) => graph["@graph"].find((node) => node["@type"] === type);

  it("describes Faresolution as an Organization", () => {
    expect(graph["@context"]).toBe("https://schema.org");
    const org = byType("Organization");
    expect(org).toMatchObject({ name: "Faresolution", url: "https://faresolution.com" });
  });

  it("adds a WebSite with a SearchAction pointing at the software directory", () => {
    const site = byType("WebSite");
    expect(site).toMatchObject({ name: "Faresolution", url: "https://faresolution.com" });
    expect(site?.potentialAction).toMatchObject({
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://faresolution.com/software?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    });
  });

  it("has no fabricated ratings or reviews", () => {
    const json = safeJsonLd(graph);
    expect(json).not.toMatch(/aggregateRating|review/i);
  });
});
