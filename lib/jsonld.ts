/**
 * Structured data (schema.org JSON-LD) helpers. Render the output in a native
 * `<script type="application/ld+json">` via `dangerouslySetInnerHTML`.
 */
import type { Article, Author, FaqItem, Platform, Product, Vendor } from "@/lib/data/types";
import { articleHref } from "@/lib/editorial";
import { OWNER_CONTACT, SITE_TAGLINE } from "@/lib/site";
import { SITE_NAME, SITE_URL, absoluteUrl, isWebUrl } from "@/lib/utils";

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
        email: OWNER_CONTACT.email,
        telephone: OWNER_CONTACT.phone,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: OWNER_CONTACT.email,
          telephone: OWNER_CONTACT.phone,
        },
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

/**
 * ItemList of pages (names and absolute URLs only, in the order shown), or
 * `null` when there are none. Carries no ratings, ranks or prices.
 */
export function itemListJsonLd(items: readonly { name: string; path: string }[]): Record<string, unknown> | null {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
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

const webUrl = (url: string | null | undefined): string | null => (url && isWebUrl(url) ? url : null);

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
  // Outbound URLs only when they are absolute http(s) addresses.
  const website = webUrl(product.website);
  const vendorWebsite = webUrl(vendor?.website);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    ...(website ? { sameAs: website } : {}),
    ...(categoryName ? { applicationCategory: categoryName } : {}),
    ...(operatingSystems.length > 0 ? { operatingSystem: operatingSystems.join(", ") } : {}),
    ...(vendor
      ? { publisher: { "@type": "Organization", name: vendor.name, ...(vendorWebsite ? { url: vendorWebsite } : {}) } }
      : {}),
    ...(startingPrice
      ? { offers: { "@type": "Offer", description: startingPrice, ...(website ? { url: website } : {}) } }
      : {}),
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

/**
 * Article for an editorial page: headline, the real published and updated
 * dates, the author (omitted when unknown), Faresolution as publisher and the
 * canonical page as the main entity.
 */
export function articleJsonLd(article: Article, author: Author | null): Record<string, unknown> {
  const url = absoluteUrl(articleHref(article.kind, article.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: article.categoryLabel,
    inLanguage: "en",
    ...(author ? { author: { "@type": "Person", name: author.name, jobTitle: author.role } } : {}),
    publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
  };
}
