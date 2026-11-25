import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PricingTable } from "@/components/product/PricingTable";
import { ProductFacts } from "@/components/product/ProductFacts";
import { ProductHeader } from "@/components/product/ProductHeader";
import { RatingsSummary, ReviewsEmptyState } from "@/components/product/ProductReviews";
import { ScreenshotFrame } from "@/components/product/ScreenshotFrame";
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

describe("PricingTable", () => {
  it("shows a price only when known, otherwise a vendor-site link, never null, NaN or a currency sign", async () => {
    const { product } = await profile();
    const html = renderToStaticMarkup(
      <PricingTable plans={product.pricing.plans} website={product.website} productName={product.name} />,
    );
    expect(text(html)).not.toMatch(/null|NaN|undefined|\$/);
    expect(html.match(/See vendor site/g)).toHaveLength(product.pricing.plans.length);

    const priced = renderToStaticMarkup(
      <PricingTable plans={[{ name: "Pro", price: "15 EUR per seat", summary: "All features." }]} website={null} productName="X" />,
    );
    expect(priced).toContain("15 EUR per seat");
    expect(priced).not.toContain("See vendor site");

    const noSite = renderToStaticMarkup(
      <PricingTable plans={[{ name: "Pro", price: null, summary: "All features." }]} website={null} productName="X" />,
    );
    expect(noSite).toContain("Not verified");
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
