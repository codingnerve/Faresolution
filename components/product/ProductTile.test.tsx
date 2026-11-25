import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductTile } from "@/components/product/ProductTile";
import { getProduct } from "@/lib/data";
import type { Product } from "@/lib/data";

async function sample(): Promise<Product> {
  const product = await getProduct("hubspot-crm");
  if (!product) throw new Error("fixture missing");
  return product;
}

function render(product: Product): string {
  return renderToStaticMarkup(<ProductTile product={product} vendorName="HubSpot" />);
}

describe("ProductTile", () => {
  it("shows name, vendor, review status and a link to the profile", async () => {
    const html = render(await sample());
    expect(html).toContain("HubSpot CRM");
    expect(html).toContain("by HubSpot");
    expect(html).toContain("No reviews yet");
    expect(html).toContain('href="/products/hubspot-crm"');
    expect(html).toContain("View details");
  });

  it("shows only known plan facts", async () => {
    const product = await sample();
    const html = render({
      ...product,
      pricing: { ...product.pricing, freePlan: true, freeTrial: null },
    });
    expect(html).toContain("Free plan");
    expect(html).not.toContain("trial");
    expect(html).not.toContain("Pricing not verified");
  });

  it("says pricing is not verified when nothing is known, never null or NaN", async () => {
    const product = await sample();
    const html = render({
      ...product,
      pricing: { ...product.pricing, freePlan: null, freeTrial: null, startingPrice: null },
    });
    expect(html).toContain("Pricing not verified");
    expect(html).not.toMatch(/null|NaN|\$/);
  });

  it("caps highlights at three", async () => {
    const product = await sample();
    const html = render({ ...product, highlights: ["One", "Two", "Three", "Four"] });
    expect(html).toContain("Three");
    expect(html).not.toContain("Four");
  });
});
