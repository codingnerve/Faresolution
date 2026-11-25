import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { articleHref } from "@/components/layout/navigation";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/LogoMark";
import { Rating } from "@/components/ui/Rating";
import { getArticle, getProduct } from "@/lib/data";

const STEPS = [
  {
    title: "Written by people who use the product",
    body: "Reviewers describe how their team uses the tool and rate ease of use, value, features and support separately.",
  },
  {
    title: "Checked before it is published",
    body: "Each review is moderated against our guidelines, and the reviewer's use of the product is verified.",
  },
  {
    title: "Ratings follow the reviews",
    body: "A product's rating is calculated only from published reviews. Until there are some, its profile says so.",
  },
];

const METHOD_ARTICLE = { kind: "research", slug: "how-faresolution-handles-product-facts-and-reviews" } as const;

/**
 * Explains the review policy in place of "recent reviews" and "highest rated":
 * no reviews have been collected yet, so none are shown.
 */
export async function HowReviewsWork() {
  const [example, method] = await Promise.all([
    getProduct("hubspot-crm"),
    getArticle(METHOD_ARTICLE.kind, METHOD_ARTICLE.slug),
  ]);

  return (
    <section aria-labelledby="home-reviews-title" className="py-16 sm:py-20 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="type-label mb-3">How reviews work</p>
          <h2 id="home-reviews-title" className="type-h2 max-w-[20ch] text-navy">
            Ratings appear when real reviews do
          </h2>
          <p className="type-body mt-4 max-w-xl text-subtle">
            We don&rsquo;t seed listings with placeholder stars or borrowed
            scores. Reviews are published only once they have been verified, so
            today every profile reads &ldquo;No reviews yet&rdquo;. That is the
            honest state of a new directory.
          </p>

          {example && (
            <figure className="mt-8 max-w-sm rounded-lg border border-line bg-surface p-4 shadow-card">
              <div className="flex items-center gap-3">
                <LogoMark name={example.name} color={example.brandColor} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">{example.name}</p>
                  <Rating value={example.rating} count={example.reviewCount} />
                </div>
              </div>
              <figcaption className="type-meta mt-3 border-t border-line pt-3">
                How a listing looks before its first verified review.
              </figcaption>
            </figure>
          )}
        </div>

        <div>
          <ol className="border-t border-line">
            {STEPS.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-line py-6">
                <span aria-hidden="true" className="font-serif text-[1.75rem] leading-none text-violet-ink tabular-nums">
                  {index + 1}
                </span>
                <div>
                  <h3 className="type-h3 text-navy">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-subtle">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            <Link
              href="/review-guidelines"
              className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
            >
              Review guidelines
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
            <Link href="/review-verification" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
              How verification works
            </Link>
            {method && (
              <Link
                href={articleHref(method.kind, method.slug)}
                className="rounded-xs text-sm font-medium text-ink hover:text-navy"
              >
                Our approach to product facts
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
