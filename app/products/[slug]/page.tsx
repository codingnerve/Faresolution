import { Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryHref } from "@/components/layout/navigation";
import { FeatureChips } from "@/components/product/FeatureGroups";
import { ProductCompact } from "@/components/product/ProductCompact";
import { ReviewsEmptyState, RatingsSummary } from "@/components/product/ProductReviews";
import { ProfileSection } from "@/components/product/ProfileSection";
import { ProsCons } from "@/components/product/ProsCons";
import { RelatedComparisons } from "@/components/product/RelatedComparisons";
import { Faq } from "@/components/ui/Faq";
import { faqJsonLd, productJsonLd, safeJsonLd } from "@/lib/jsonld";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";
import { productTabHref } from "@/lib/products/tabs";
import { formatPricing } from "@/lib/utils";

const SIMILAR_ON_OVERVIEW = 4;

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), null);
}

export default async function ProductOverviewPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();

  const { product, vendor, primaryCategory, categories, featureGroups, featureCount, similar, vendorNames, comparisons } =
    profile;
  const tab = (segment: Parameters<typeof productTabHref>[1]) => productTabHref(slug, segment);
  const faqLd = faqJsonLd(product.faq);

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* 1. Introduction */}
      <ProfileSection id="about" title={`About ${product.name}`}>
        <p className="max-w-3xl text-[1.0625rem] leading-8 text-ink">{product.description}</p>
        {categories.length > 0 && (
          <p className="mt-5 flex flex-wrap items-center gap-2">
            <span className="type-label mr-1">Listed in</span>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={categoryHref(category.slug)}
                className="inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-3 text-sm font-medium text-ink hover:border-navy hover:text-navy"
              >
                {category.name}
              </Link>
            ))}
          </p>
        )}
      </ProfileSection>

      {/* 2. Highlights */}
      {product.highlights.length > 0 && (
        <ProfileSection id="highlights" title="Highlights">
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {product.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-[0.9375rem] leading-6 text-ink">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue" strokeWidth={2.25} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      {/* 3. Features */}
      {featureCount > 0 && (
        <ProfileSection
          id="features"
          title="Features"
          description={`${featureCount} ${featureCount === 1 ? "feature" : "features"} listed for ${product.name}.`}
          more={{ href: tab("features"), label: "All features" }}
        >
          <FeatureChips groups={featureGroups} />
        </ProfileSection>
      )}

      {/* 4. Pros and cons */}
      {(product.pros.length > 0 || product.cons.length > 0) && (
        <ProfileSection
          id="pros-cons"
          title="Strengths and limitations"
          description="Our editorial summary from public product information, not user reviews."
        >
          <ProsCons pros={product.pros} cons={product.cons} />
        </ProfileSection>
      )}

      {/* 5. Customer ratings */}
      <ProfileSection id="ratings" title="Customer ratings">
        <RatingsSummary product={product} />
      </ProfileSection>

      {/* 6. Pricing overview */}
      <ProfileSection id="pricing" title="Pricing overview" more={{ href: tab("pricing"), label: "Plans and pricing" }}>
        <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          <p className="text-[1.0625rem] font-semibold text-navy">{formatPricing(product)}</p>
          {product.pricing.plans.length > 0 && (
            <p className="type-body mt-2 text-ink">
              Plans: {product.pricing.plans.map((plan) => plan.name).join(", ")}.
            </p>
          )}
          {product.pricing.note && <p className="type-meta mt-3">{product.pricing.note}</p>}
        </div>
      </ProfileSection>

      {/* 7. Similar products */}
      {similar.length > 0 && (
        <ProfileSection
          id="similar"
          title="Similar products"
          description={
            primaryCategory
              ? `Other ${primaryCategory.name} options and products with overlapping features.`
              : "Products with overlapping categories and features."
          }
          more={{ href: tab("alternatives"), label: "All alternatives" }}
        >
          <ul className="grid gap-4 sm:grid-cols-2">
            {similar.slice(0, SIMILAR_ON_OVERVIEW).map((p) => (
              <li key={p.slug}>
                <ProductCompact product={p} vendorName={vendorNames.get(p.vendorSlug) ?? null} />
              </li>
            ))}
          </ul>
        </ProfileSection>
      )}

      {/* 8. Related comparisons (hidden when there are none) */}
      {comparisons.length > 0 && (
        <ProfileSection id="comparisons" title="Related comparisons" description="Picked by our editors.">
          <RelatedComparisons comparisons={comparisons} />
        </ProfileSection>
      )}

      {/* 9. Customer reviews */}
      <ProfileSection id="reviews" title="Customer reviews">
        <ReviewsEmptyState product={product} />
      </ProfileSection>

      {/* 10. FAQ */}
      {product.faq.length > 0 && (
        <ProfileSection id="faq" title={`${product.name} FAQ`}>
          <Faq items={product.faq} />
        </ProfileSection>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(productJsonLd(product, { vendor, categoryName: primaryCategory?.name ?? null })),
        }}
      />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />}
    </div>
  );
}
