import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlternativesFinder, type FinderGroup } from "@/components/alternatives/AlternativesFinder";
import { ReviewsHeader, ReviewsStatus } from "@/components/reviews/ReviewsHeader";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getCategories, getProducts, getVendors } from "@/lib/data";

const title = "Software reviews";
const description =
  "Review collection hasn't opened yet. See how reviews on Faresolution will work, including the criteria, moderation and verification plans, and start a draft in your browser.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/reviews" },
  openGraph: { type: "website", url: "/reviews", title, description },
};

const CRITERIA = ["Overall rating", "Ease of use", "Value for money", "Features", "Customer support"];

const PILLARS: { title: string; body: string; list?: string[]; href?: string; cta?: string }[] = [
  {
    title: "What a review will contain",
    body: "Five separate ratings from 1 to 5, a headline, what you liked and what could be better, a written account of at least 50 characters, how long you have used the product, and context about your role, company size and industry.",
    list: CRITERIA,
  },
  {
    title: "How reviews will be moderated",
    body: "Every review will be read against the review guidelines before it is published. Reviews that break them will be declined or returned for changes, and vendors will not be able to remove or edit a review.",
    href: "/review-guidelines",
    cta: "Read the guidelines",
  },
  {
    title: "How reviewers will be verified",
    body: "Reviewers will be asked to show they use the product, for example with a work email address, a professional profile or a screenshot of their account. Only verified reviews will count toward a rating.",
    href: "/review-verification",
    cta: "Read the verification plan",
  },
];

export default async function ReviewsPage() {
  const [products, categories, vendors] = await Promise.all([getProducts(), getCategories(), getVendors()]);
  const vendorName = new Map(vendors.map((v) => [v.slug, v.name]));

  const groups: FinderGroup[] = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      products: products
        .filter((p) => p.primaryCategory === category.slug)
        .sort((a, b) => a.name.localeCompare(b.name, "en") || a.slug.localeCompare(b.slug))
        .map((p) => ({
          slug: p.slug,
          name: p.name,
          vendorName: vendorName.get(p.vendorSlug) ?? null,
          brandColor: p.brandColor,
        })),
    }))
    .filter((group) => group.products.length > 0);

  return (
    <>
      <ReviewsHeader
        current="/reviews"
        crumbs={[{ label: "Home", href: "/" }, { label: "Reviews" }]}
        title="Software reviews"
        intro={
          <p>
            Reviews on Faresolution will come from people who use the software they write about. Collection hasn&rsquo;t
            opened yet, so there is nothing to read today. This page explains how it will work, and lets you start a
            draft for when it does.
          </p>
        }
      />

      <Container className="py-10 sm:py-14">
        <ReviewsStatus />

        <section aria-labelledby="how-title" className="mt-12 sm:mt-16">
          <p className="type-label mb-3">How reviews will work</p>
          <h2 id="how-title" className="type-h2 max-w-2xl text-navy">
            Reviews will be written by users and checked before they are published
          </h2>
          <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.title} className="border-t border-line pt-4">
                <h3 className="type-h3 text-navy">{pillar.title}</h3>
                <p className="type-body mt-2 text-subtle">{pillar.body}</p>
                {pillar.list && (
                  <ul className="mt-3 space-y-1 text-sm text-ink">
                    {pillar.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {pillar.href && (
                  <Link
                    href={pillar.href}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
                  >
                    {pillar.cta}
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                  </Link>
                )}
              </div>
            ))}
          </div>
          <p className="type-body mt-8 max-w-2xl text-subtle">
            Ratings will be calculated only from published, verified reviews. Until a product has some, its profile will
            keep saying &ldquo;No reviews yet&rdquo;.
          </p>
        </section>

        <section aria-labelledby="draft-title" className="mt-14 border-t border-line pt-10 sm:mt-16">
          <h2 id="draft-title" className="type-h2 mb-2 text-navy">
            Start a review draft
          </h2>
          <p className="type-body mb-6 max-w-2xl text-subtle">
            Choose a product you use. Your draft is saved only in this browser; nothing is sent or published, and you
            can edit or clear it at any time.
          </p>
          <DemoDataNotice className="mb-8" />
          <AlternativesFinder groups={groups} hrefBase="/reviews/write/" linkSuffix="" />
        </section>
      </Container>
    </>
  );
}
