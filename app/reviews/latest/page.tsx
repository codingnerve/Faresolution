import { Clock } from "lucide-react";
import type { Metadata } from "next";
import { ReviewsHeader, ReviewsStatus } from "@/components/reviews/ReviewsHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildMetadata } from "@/lib/seo";

const title = "Latest software reviews";
const description =
  "The newest published reviews will be listed here once review collection opens. None have been collected or published yet.";

// R14: nothing to list until review collection opens, so noindex (links still
// followed) and not in the sitemap (NOINDEX_UNTIL_REVIEWS_OPEN in lib/sitemap.ts).
export const metadata: Metadata = buildMetadata({ title, description, path: "/reviews/latest", noindex: true });

export default function LatestReviewsPage() {
  return (
    <>
      <ReviewsHeader
        current="/reviews/latest"
        crumbs={[{ label: "Home", href: "/" }, { label: "Reviews", href: "/reviews" }, { label: "Latest reviews" }]}
        title="Latest reviews"
        intro={<p>The most recently published reviews will appear here, newest first, once review collection opens.</p>}
      />
      <Container className="py-10 sm:py-14">
        <ReviewsStatus className="mb-8" />
        <EmptyState
          icon={Clock}
          title="No reviews to show yet"
          description="When collection opens and reviews have been checked against the guidelines, each published review will appear here with its product, the five ratings, and the reviewer's role, company size and length of use. Nothing is shown until then, and this page will not be filled with placeholder reviews."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/reviews">Start a review draft</Button>
              <Button href="/review-guidelines" variant="secondary">
                Read the guidelines
              </Button>
            </div>
          }
        />
      </Container>
    </>
  );
}
