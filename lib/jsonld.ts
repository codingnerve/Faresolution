/**
 * Structured data (schema.org JSON-LD) helpers. Render the output in a native
 * `<script type="application/ld+json">` via `dangerouslySetInnerHTML`.
 */
import type { FaqItem, Platform, Product, Vendor } from "@/lib/data/types";
import { SITE_TAGLINE } from "@/lib/site";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/utils";

/**
 * JSON for an inline script. `<` becomes `<` so no string in the data can
 * close the script tag or open a new one; the JSON still parses to the same value.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The publisher and the site, as one graph: an Organization plus a WebSite
 * whose SearchAction points at the software directory search.
 */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL,
        slogan: SITE_TAGLINE,
        description:
          "An independent directory for finding, comparing and shortlisting business software.",
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/software")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/**
 * FAQPage for questions that are visible on the page, or `null` when there are
 * none (Google requires the marked-up Q&A to appear on the page).
 */
export function faqJsonLd(faq: readonly FaqItem[]): Record<string, unknown> | null {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Operating systems a product runs on; "api" is not one, so it is left out. */
const OPERATING_SYSTEM: Partial<Record<Platform, string>> = {
  web: "Web browser",
  ios: "iOS",
  android: "Android",
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
};

export interface ProductJsonLdContext {
  vendor?: Pick<Vendor, "name" | "website"> | null;
  /** Display name of the product's primary category. */
  categoryName?: string | null;
}

/**
 * SoftwareApplication for a product profile. Only known facts are included:
 * no `aggregateRating` or `review` until real reviews exist (a rating needs
 * reviews behind it), and no `offers` unless a starting price is known.
 */
export function productJsonLd(product: Product, context: ProductJsonLdContext = {}): Record<string, unknown> {
  const { vendor, categoryName } = context;
  const operatingSystems = product.platforms
    .map((platform) => OPERATING_SYSTEM[platform])
    .filter((os): os is string => Boolean(os));
  const startingPrice = product.pricing.startingPrice?.trim();
  const rated =
    product.rating !== null && Number.isFinite(product.rating) && product.rating > 0 && product.reviewCount > 0;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    sameAs: product.website,
    ...(categoryName ? { applicationCategory: categoryName } : {}),
    ...(operatingSystems.length > 0 ? { operatingSystem: operatingSystems.join(", ") } : {}),
    ...(vendor ? { publisher: { "@type": "Organization", name: vendor.name, url: vendor.website } } : {}),
    ...(startingPrice ? { offers: { "@type": "Offer", description: startingPrice, url: product.website } } : {}),
    ...(rated
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
          },
        }
      : {}),
  };
}
