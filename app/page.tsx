import type { Metadata } from "next";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { ClosingCta } from "@/components/home/ClosingCta";
import { EditorialGrid } from "@/components/home/EditorialGrid";
import { EditorsShortlist } from "@/components/home/EditorsShortlist";
import { Hero } from "@/components/home/Hero";
import { HowReviewsWork } from "@/components/home/HowReviewsWork";
import { IndustryList } from "@/components/home/IndustryList";
import { PopularComparisons } from "@/components/home/PopularComparisons";
import { VendorStrip } from "@/components/home/VendorStrip";
import { organizationJsonLd, safeJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { SITE_TAGLINE } from "@/lib/site";
import { SITE_NAME } from "@/lib/utils";

const title = `${SITE_NAME}: ${SITE_TAGLINE}`;
const description =
  "Find the software that moves your business forward. Browse business software by category, compare products side by side and build a shortlist your team can agree on.";

// The title already names the site, so it skips the "| Faresolution" template.
export const metadata: Metadata = buildMetadata({ title: { absolute: title }, description, path: "/" });

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
      <ClosingCta />
    </>
  );
}
