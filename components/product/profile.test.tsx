import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlanCards } from "@/components/product/PlanCards";
import { ProductFacts } from "@/components/product/ProductFacts";
import { ProductHeader } from "@/components/product/ProductHeader";
import { RatingsSummary, ReviewsEmptyState } from "@/components/product/ProductReviews";
import { ScreenshotFrame } from "@/components/product/ScreenshotFrame";
import { SimilarComparison } from "@/components/product/SimilarComparison";
import { getProductProfile } from "@/lib/products/profile";

async function profile(slug = "hubspot-crm") {
  const p = await getProductProfile(slug);
  if (!p) throw new Error("fixture missing");
  return p;
}

/** Visible text only (attributes and tags removed). */
const text = (html: string) => html.replace(/<[^>]+>/g, " ");

describe("ProductHeader", () => {
  it("renders the H1, vendor and the profile actions, including Compare (R4)", async () => {
    const { product, vendor, primaryCategory } = await profile();
    const html = renderToStaticMarkup(
      <ProductHeader product={product} vendor={vendor} primaryCategory={primaryCategory} />,
    );
    expect(html).toMatch(/<h1[^>]*>HubSpot CRM<\/h1>/);
    expect(html).toContain("by HubSpot");
    expect(html).toContain('href="/contact?product=hubspot-crm"');
    expect(html).toContain('href="/reviews/write/hubspot-crm"');
    expect(html).toContain('aria-pressed="false"');
    // Compare toggle with a stable name; not selected on the server render.
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*aria-label="Compare HubSpot CRM"/);
    expect(text(html)).toMatch(/Compare/);
    expect(html).toContain("No reviews yet");
  });

  it("gives the save toggle a constant name, with aria-pressed carrying the state", async () => {
    const { product, vendor, primaryCategory } = await profile();
    const html = renderToStaticMarkup(
      <ProductHeader product={product} vendor={vendor} primaryCategory={primaryCategory} />,
    );
    const save = html.match(/<button[^>]*title="Save to this browser"[^>]*>.*?<\/button>/)?.[0] ?? "";
    expect(save).toContain('aria-pressed="false"');
    expect(text(save).replace(/\s+/g, " ").trim()).toBe("Save HubSpot CRM");
    expect(save).not.toContain("aria-label");
  });

  it("links the vendor website in a new tab without sponsored or nofollow", async () => {
    const { product, vendor, primaryCategory } = await profile();
    const html = renderToStaticMarkup(
      <ProductHeader product={product} vendor={vendor} primaryCategory={primaryCategory} />,
    );
    const link = html.match(/<a[^>]*href="https:\/\/www\.hubspot\.com\/products\/crm"[^>]*>/)?.[0] ?? "";
    expect(link).toContain('target="_blank"');
    expect(link).toContain('rel="noopener noreferrer"');
    expect(link).not.toMatch(/sponsored|nofollow/);
  });

  it("drops the website link for a non-http address", async () => {
    const { product, vendor, primaryCategory } = await profile();
    const html = renderToStaticMarkup(
      <ProductHeader
        product={{ ...product, website: "javascript:alert(1)" }}
        vendor={vendor}
        primaryCategory={primaryCategory}
      />,
    );
    expect(html).not.toContain("Visit website");
    expect(html).not.toContain("javascript:");
  });
});

describe("PlanCards", () => {
  it("shows each published price, says 'Price on request' otherwise, and never null, NaN or undefined", async () => {
    const { product } = await profile();
    const html = renderToStaticMarkup(
      <PlanCards pricing={product.pricing} website={product.website} productName={product.name} />,
    );
    expect(text(html)).not.toMatch(/null|NaN|undefined/);
    expect(html).toMatch(/<ul[^>]*aria-label="HubSpot CRM plans"/);
    expect(html.match(/<h3/g)).toHaveLength(product.pricing.plans.length);
    // "$20/seat/mo" is set as a large amount and a small unit.
    expect(text(html)).toMatch(/\$20\s+\/seat\/mo/);
    // Where the prices came from, with the check date and a source link.
    expect(text(html)).toContain("checked 27 Nov 2026");
    expect(html).toContain('href="https://www.hubspot.com/pricing/sales"');

    const quote = renderToStaticMarkup(
      <PlanCards
        pricing={{ ...product.pricing, plans: [{ name: "Pro", price: null, summary: "All features." }] }}
        website="https://example.com"
        productName="X"
      />,
    );
    expect(text(quote)).toContain("Price on request");
    expect(text(quote)).toContain("Ask X for a quote");
  });

  it("respects the plan limit", async () => {
    const { product } = await profile("zoho-crm");
    const html = renderToStaticMarkup(
      <PlanCards pricing={product.pricing} website={product.website} productName={product.name} limit={2} />,
    );
    expect(html.match(/<h3/g)).toHaveLength(2);
  });
});

describe("SimilarComparison", () => {
  it("puts the product beside its alternatives with starting prices and compare links", async () => {
    const { product, alternatives, vendorNames } = await profile();
    const others = alternatives.slice(0, 3).map((a) => a.product);
    const html = renderToStaticMarkup(<SimilarComparison product={product} others={others} vendorNames={vendorNames} />);
    expect(html.match(/<th[^>]*scope="col"/g)).toHaveLength(others.length + 1);
    expect(text(html)).toContain("Starting price");
    expect(text(html)).not.toMatch(/null|NaN|undefined/);
    for (const other of others) {
      expect(html).toContain(`aria-label="Compare HubSpot CRM vs ${other.name}"`);
    }
  });
});

describe("ProductFacts", () => {
  it("says Not verified for facts the data does not state", async () => {
    const { product, categories, industries } = await profile();
    const html = renderToStaticMarkup(
      <ProductFacts
        product={{ ...product, deployment: [], platforms: [], companySizes: [] }}
        categories={categories}
        industries={[]}
      />,
    );
    expect(html.match(/Not verified/g)?.length).toBe(4);
    const full = renderToStaticMarkup(<ProductFacts product={product} categories={categories} industries={industries} />);
    expect(full).not.toContain("Not verified");
    expect(text(full)).not.toMatch(/null|NaN|undefined/);
  });
});

describe("empty review and screenshot states", () => {
  it("never shows stars or a score without reviews, and offers to write one", async () => {
    const { product } = await profile();
    const html = renderToStaticMarkup(
      <>
        <RatingsSummary product={product} />
        <ReviewsEmptyState product={product} />
      </>,
    );
    expect(html).toContain("No reviews yet");
    expect(html).not.toMatch(/0\.0|Rated /);
    expect(html).toContain('href="/reviews/write/hubspot-crm"');
  });

  it("uses a placeholder, not an image, for screenshots", () => {
    const html = renderToStaticMarkup(<ScreenshotFrame name="Jira" />);
    expect(html).toContain("Vendor screenshots appear once submitted");
    expect(html).not.toContain("<img");
  });
});
