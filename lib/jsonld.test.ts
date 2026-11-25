import { describe, expect, it } from "vitest";
import { faqJsonLd, organizationJsonLd, safeJsonLd } from "@/lib/jsonld";

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

describe("faqJsonLd", () => {
  const faq = [
    { q: "What is it?", a: "A thing." },
    { q: "Is <b>this</b> safe?", a: "Yes, </script> is escaped." },
  ];

  it("builds a FAQPage with one Question and accepted Answer per item", () => {
    expect(faqJsonLd(faq)).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is it?", acceptedAnswer: { "@type": "Answer", text: "A thing." } },
        {
          "@type": "Question",
          name: "Is <b>this</b> safe?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, </script> is escaped." },
        },
      ],
    });
  });

  it("escapes < once serialised with safeJsonLd", () => {
    const out = safeJsonLd(faqJsonLd(faq));
    expect(out).not.toContain("<");
    expect(JSON.parse(out).mainEntity[1].name).toBe("Is <b>this</b> safe?");
  });

  it("returns null when there are no questions", () => {
    expect(faqJsonLd([])).toBeNull();
  });
});
