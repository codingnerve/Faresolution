import { describe, expect, it } from "vitest";
import { getProduct } from "@/lib/data";
import { faqJsonLd, itemListJsonLd, organizationJsonLd, productJsonLd, safeJsonLd } from "@/lib/jsonld";

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

describe("productJsonLd", () => {
  async function sample() {
    const product = await getProduct("hubspot-crm");
    if (!product) throw new Error("fixture missing");
    return product;
  }
  const vendor = { slug: "hubspot", name: "HubSpot", website: "https://www.hubspot.com", description: "", headquarters: null };

  it("describes the product as a SoftwareApplication with its profile URL, category and publisher", async () => {
    const product = await sample();
    const ld = productJsonLd(product, { vendor, categoryName: "CRM Software" });
    expect(ld).toMatchObject({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "HubSpot CRM",
      description: product.description,
      url: "https://faresolution.com/products/hubspot-crm",
      applicationCategory: "CRM Software",
      sameAs: product.website,
      publisher: { "@type": "Organization", name: "HubSpot", url: "https://www.hubspot.com" },
    });
  });

  it("omits aggregateRating when rating is null and offers when startingPrice is null", async () => {
    const product = await sample();
    const ld = productJsonLd({ ...product, rating: null, reviewCount: 0 });
    expect(ld).not.toHaveProperty("aggregateRating");
    expect(ld).not.toHaveProperty("review");
    expect(product.pricing.startingPrice).toBeNull();
    expect(ld).not.toHaveProperty("offers");
    expect(safeJsonLd(ld)).not.toMatch(/aggregateRating|offers|null|NaN|undefined/);
  });

  it("omits aggregateRating even for a rating with no reviews behind it", async () => {
    const product = await sample();
    expect(productJsonLd({ ...product, rating: 4.5, reviewCount: 0 })).not.toHaveProperty("aggregateRating");
  });

  it("adds an offer only when a starting price is known", async () => {
    const product = await sample();
    const ld = productJsonLd({ ...product, pricing: { ...product.pricing, startingPrice: "From 15 USD per seat" } });
    expect(ld.offers).toMatchObject({ "@type": "Offer", description: "From 15 USD per seat" });
  });

  it("omits publisher and category when they are not given", async () => {
    const ld = productJsonLd(await sample());
    expect(ld).not.toHaveProperty("publisher");
    expect(ld).not.toHaveProperty("applicationCategory");
  });

  it("escapes < in text once serialised", async () => {
    const product = await sample();
    const out = safeJsonLd(productJsonLd({ ...product, name: "</script><b>", description: "a < b" }));
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><b>");
  });
});

describe("itemListJsonLd", () => {
  it("is null for an empty list", () => {
    expect(itemListJsonLd([])).toBeNull();
  });

  it("lists names and absolute urls in order, and nothing else", () => {
    const ld = itemListJsonLd([
      { name: "Zoho CRM", path: "/products/zoho-crm" },
      { name: "Pipedrive", path: "/products/pipedrive" },
    ]);
    expect(ld).toMatchObject({ "@type": "ItemList" });
    expect(ld?.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Zoho CRM", url: "https://faresolution.com/products/zoho-crm" },
      { "@type": "ListItem", position: 2, name: "Pipedrive", url: "https://faresolution.com/products/pipedrive" },
    ]);
  });
});
