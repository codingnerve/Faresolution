/**
 * Structured data (schema.org JSON-LD) helpers. Render the output in a native
 * `<script type="application/ld+json">` via `dangerouslySetInnerHTML`.
 * Product JSON-LD is added by the product profile task.
 */
import type { FaqItem } from "@/lib/data/types";
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
