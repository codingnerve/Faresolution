import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewDraftForm } from "@/components/forms/ReviewDraftForm";
import { productHref } from "@/components/layout/navigation";
import { ReviewsHeader, ReviewsStatus } from "@/components/reviews/ReviewsHeader";
import { Container } from "@/components/ui/Container";
import { LogoMark } from "@/components/ui/LogoMark";
import { getIndustries, getProduct, getProducts } from "@/lib/data";

// Every product has a draft page at build time. Unknown slugs get a real 404
// from proxy.ts (lib/route-guards.ts, R12); `notFound()` below is defence in depth.
export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ product: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/reviews/write/[product]">): Promise<Metadata> {
  const { product: slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const path = `/reviews/write/${product.slug}`;
  const title = `Write a review of ${product.name}`;
  const description = `Draft a review of ${product.name}. Review collection hasn't opened yet, so your draft is saved only in your browser.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    // A form page with nothing to read: kept out of search results.
    robots: { index: false, follow: true },
    openGraph: { type: "website", url: path, title, description },
  };
}

export default async function WriteReviewPage({ params }: PageProps<"/reviews/write/[product]">) {
  const { product: slug } = await params;
  const [product, industries] = await Promise.all([getProduct(slug), getIndustries()]);
  if (!product) notFound();

  return (
    <>
      <ReviewsHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Reviews", href: "/reviews" },
          { label: product.name, href: productHref(product.slug) },
          { label: "Write a review" },
        ]}
        title={`Write a review of ${product.name}`}
        intro={
          <p>
            Share how you use {product.name}. Review collection isn&rsquo;t open yet, so this saves a draft in your
            browser rather than submitting a review.
          </p>
        }
      />
      <Container width="narrow" className="py-10 sm:py-14">
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-card">
          <LogoMark name={product.name} color={product.brandColor} size={44} className="shrink-0" />
          <div className="min-w-0">
            <p className="type-label">Reviewing</p>
            <Link
              href={productHref(product.slug)}
              className="block truncate rounded-xs text-lg leading-6 font-semibold text-navy hover:text-blue-ink"
            >
              {product.name}
            </Link>
            <p className="type-meta truncate">{product.tagline}</p>
          </div>
        </div>
        <ReviewsStatus className="mb-10" />
        <ReviewDraftForm
          product={{ slug: product.slug, name: product.name }}
          industries={industries.map((industry) => industry.name)}
        />
      </Container>
    </>
  );
}
