import type { Metadata } from "next";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { EditorialGrid } from "@/components/home/EditorialGrid";
import { EditorsShortlist } from "@/components/home/EditorsShortlist";
import { Hero } from "@/components/home/Hero";
import { HowReviewsWork } from "@/components/home/HowReviewsWork";
import { IndustryList } from "@/components/home/IndustryList";
import { NewsletterBand } from "@/components/home/NewsletterBand";
import { PopularComparisons } from "@/components/home/PopularComparisons";
import { VendorStrip } from "@/components/home/VendorStrip";
import { organizationJsonLd, safeJsonLd } from "@/lib/jsonld";
import { SITE_TAGLINE } from "@/lib/site";
import { SITE_NAME } from "@/lib/utils";

const title = `${SITE_NAME}: ${SITE_TAGLINE}`;
const description =
  "Find the software that moves your business forward. Browse business software by category, compare products side by side and build a shortlist your team can agree on.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/",
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd()) }}
      />
      <Hero />
      <CategoryIndex />
      <EditorsShortlist />
      <PopularComparisons />
      <IndustryList />
      <HowReviewsWork />
      <VendorStrip />
      <EditorialGrid />
      <NewsletterBand />
    </>
  );
}
