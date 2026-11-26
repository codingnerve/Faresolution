import { ThumbsUp } from "lucide-react";
import type { Metadata } from "next";
import { ReviewsHeader, ReviewsStatus } from "@/components/reviews/ReviewsHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildMetadata } from "@/lib/seo";

const title = "Most helpful software reviews";
const description =
  "Reviews that readers find most useful will be listed here once review collection opens. None have been collected or published yet.";

// R14: nothing to list until review collection opens, so noindex (links still
// followed) and not in the sitemap (NOINDEX_UNTIL_REVIEWS_OPEN in lib/sitemap.ts).
export const metadata: Metadata = buildMetadata({ title, description, path: "/reviews/helpful", noindex: true });

export default function HelpfulReviewsPage() {
  return (
    <>
      <ReviewsHeader
        current="/reviews/helpful"
        crumbs={[{ label: "Home", href: "/" }, { label: "Reviews", href: "/reviews" }, { label: "Most helpful" }]}
        title="Most helpful reviews"
        intro={
          <p>
            Once reviews are published, readers will be able to mark the ones that helped them decide, and the most
            helpful will be gathered here.
          </p>
        }
      />
      <Container className="py-10 sm:py-14">
        <ReviewsStatus className="mb-8" />
        <EmptyState
          icon={ThumbsUp}
          title="Nothing is marked helpful yet"
          description="This page will list reviews in order of how many readers found them useful. It will stay empty until review collection opens, reviews are published and readers have had a chance to respond. It will not show placeholder reviews or invented helpfulness counts."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/reviews">Start a review draft</Button>
              <Button href="/reviews/latest" variant="secondary">
                Latest reviews
              </Button>
            </div>
          }
        />
      </Container>
    </>
  );
}
