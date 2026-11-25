import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCompact } from "@/components/product/ProductCompact";
import { ProductRow } from "@/components/product/ProductRow";
import { ProductTile } from "@/components/product/ProductTile";
import { getProduct } from "@/lib/data";
import type { Product } from "@/lib/data";
import { toDirectoryProduct } from "@/lib/directory/data";

async function sample(): Promise<Product> {
  const product = await getProduct("hubspot-crm");
  if (!product) throw new Error("fixture missing");
  return product;
}

const cards = [
  ["ProductTile", ProductTile],
  ["ProductRow", ProductRow],
  ["ProductCompact", ProductCompact],
] as const;

describe.each(cards)("%s", (_, Card) => {
  const render = (product: Product) =>
    renderToStaticMarkup(<Card product={toDirectoryProduct(product, "HubSpot")} vendorName="HubSpot" />);

  it("shows name, vendor, review status and a labelled link to the profile", async () => {
    const html = render(await sample());
    expect(html).toContain("HubSpot CRM");
    expect(html).toContain("by HubSpot");
    expect(html).toContain("No reviews yet");
    expect(html).toContain('href="/products/hubspot-crm"');
    expect(html).toContain('aria-label="View details for HubSpot CRM"');
  });

  it("says pricing is not verified when nothing is known, never null, NaN or a price", async () => {
    const product = await sample();
    const html = render({
      ...product,
      pricing: { ...product.pricing, freePlan: null, freeTrial: null, startingPrice: null },
    });
    expect(html).toContain("Pricing not verified");
    expect(html).not.toMatch(/null|NaN|\$/);
  });

  it("shows known plan facts only", async () => {
    const product = await sample();
    const html = render({ ...product, pricing: { ...product.pricing, freePlan: true, freeTrial: false } });
    expect(html).toContain("Free plan");
    expect(html).toContain("No free trial");
    expect(html).not.toContain("Pricing not verified");
  });

  it("has a Compare toggle named after the product, off on the server render, unless turned off", async () => {
    const product = await sample();
    const html = render(product);
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*aria-label="Compare HubSpot CRM"/);
    const without = renderToStaticMarkup(
      <Card product={toDirectoryProduct(product, "HubSpot")} vendorName="HubSpot" compare={false} />,
    );
    expect(without).not.toContain("Compare HubSpot CRM");
  });

  it("caps highlights at three", async () => {
    const product = await sample();
    const html = render({ ...product, highlights: ["One", "Two", "Three", "Four"] });
    expect(html).toContain("Three");
    expect(html).not.toContain("Four");
  });
});
