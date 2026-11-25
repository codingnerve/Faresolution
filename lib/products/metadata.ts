import type { Metadata } from "next";
import type { ProductProfile } from "./profile";
import { productTabHref, type ProductTabSegment } from "./tabs";

/** Tabs with no content yet (no reviews, no screenshots): kept out of search results. */
const EMPTY_TABS: ReadonlySet<ProductTabSegment> = new Set(["reviews", "screenshots"]);

function copy(profile: ProductProfile, segment: ProductTabSegment | null): { title: string; description: string } {
  const { product, vendor, primaryCategory } = profile;
  const name = product.name;
  const by = vendor ? ` by ${vendor.name}` : "";
  const inCategory = primaryCategory ? ` in ${primaryCategory.name}` : "";
  switch (segment) {
    case null:
      return {
        title: `${name}: Features, Pricing and Alternatives`,
        description: `${name}${by}: ${product.tagline} See its features, plans, integrations and similar products.`,
      };
    case "reviews":
      return {
        title: `${name} Reviews`,
        description: `Reviews of ${name} will appear here once review collection opens. No ratings are shown until then.`,
      };
    case "pricing":
      return {
        title: `${name} Pricing and Plans`,
        description: `${name} plans, free plan and trial facts as listed. Prices are shown only when verified; check the vendor's site for current pricing.`,
      };
    case "features":
      return {
        title: `${name} Features`,
        description: `The ${profile.featureCount} features listed for ${name}, grouped by area, with links to other products that offer them.`,
      };
    case "alternatives":
      return {
        title: `${name} Alternatives`,
        description: `Products similar to ${name}${inCategory}, matched on category and shared features.`,
      };
    case "integrations":
      return {
        title: `${name} Integrations`,
        description:
          profile.integrations.length > 0
            ? `${profile.integrations.length} integrations listed for ${name}, including ${profile.integrations
                .slice(0, 3)
                .map((i) => i.integration.name)
                .join(", ")}.`
            : `Integrations for ${name} have not been listed yet.`,
      };
    case "screenshots":
      return {
        title: `${name} Screenshots`,
        description: `Screenshots of ${name} will appear here once the vendor submits them.`,
      };
    case "faq":
      return {
        title: `${name} FAQ`,
        description: `Common questions about ${name}${by}, answered from public product information.`,
      };
  }
}

/** Title, description, canonical and Open Graph for one profile tab (canonical to itself). */
export function productTabMetadata(profile: ProductProfile | null, segment: ProductTabSegment | null): Metadata {
  if (!profile) return {};
  const { title, description } = copy(profile, segment);
  const path = productTabHref(profile.product.slug, segment);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description },
    ...(segment && EMPTY_TABS.has(segment) ? { robots: { index: false, follow: true } } : {}),
  };
}
