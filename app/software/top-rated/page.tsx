import { ArrowRight, Star } from "lucide-react";
import type { Metadata } from "next";
import { DirectoryHeader, DirectoryPage } from "@/components/directory/DirectoryPage";
import { ProductCompact } from "@/components/product/ProductCompact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDirectoryData, hasRating } from "@/lib/directory/data";
import { applyQuery, DEFAULT_QUERY } from "@/lib/directory/query";

const title = "Top rated software";
const description =
  "This page will rank business software by ratings from verified reviews once review collection opens. No products are rated yet.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/software/top-rated" },
  openGraph: { url: "/software/top-rated", title, description },
};

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Software", href: "/software" },
  { label: "Top rated" },
];

export default async function TopRatedSoftwarePage() {
  const data = await getDirectoryData(hasRating);

  if (data.ratingsAvailable) {
    return (
      <DirectoryPage
        data={data}
        preset={{ basePath: "/software/top-rated", locked: { sort: "rating" } }}
        header={
          <DirectoryHeader
            current="/software/top-rated"
            crumbs={crumbs}
            title="Top rated software"
            intro={<p>Products ordered by their average rating from verified reviews.</p>}
          />
        }
      />
    );
  }

  // No product has a review-backed rating yet: say so instead of ranking anything.
  const all = await getDirectoryData();
  const picks = applyQuery(all.products, { ...DEFAULT_QUERY, sort: "trending" }).filter(
    (p) => p.trendingRank !== null,
  );

  return (
    <>
      <DirectoryHeader
        current="/software/top-rated"
        crumbs={crumbs}
        title="Top rated software"
        intro={
          <p>
            This page will rank products by the ratings in verified user reviews. Nothing is ranked
            yet, because we have not collected any reviews.
          </p>
        }
      />
      <Container className="py-10 sm:py-12">
        <EmptyState
          icon={Star}
          title="No ratings yet"
          description="Ratings will appear here once reviews open. Each one will come from a review checked against our guidelines, so the ranking reflects real use rather than marketing."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/reviews">Write a review</Button>
              <Button href="/software" variant="secondary">
                Browse all software
              </Button>
            </div>
          }
        />

        {picks.length > 0 && (
          <section aria-labelledby="picks-heading" className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="type-label">Editor-curated</p>
                <h2 id="picks-heading" className="type-h2 mt-2 text-navy">
                  In the meantime: our editors&rsquo; picks
                </h2>
                <p className="type-body mt-2 max-w-2xl text-subtle">
                  A selection made by our editors, not a ranking by rating.
                </p>
              </div>
              <Button href="/software/trending" variant="link">
                See all editor&rsquo;s picks
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {picks.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <ProductCompact product={p} vendorName={p.vendorName} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
