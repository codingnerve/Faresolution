import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyingGuide } from "@/components/categories/BuyingGuide";
import { RelatedCategories } from "@/components/categories/RelatedCategories";
import { TopProducts } from "@/components/categories/TopProducts";
import { DirectoryListing } from "@/components/directory/DirectoryPage";
import { RelatedArticles } from "@/components/industries/RelatedArticles";
import { industryHref } from "@/components/layout/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { Faq } from "@/components/ui/Faq";
import { getIndustries, getVendors } from "@/lib/data";
import { getDirectoryData } from "@/lib/directory/data";
import { INDUSTRY_PICK_LIMIT, getIndustryPageData } from "@/lib/industries/page-data";
import { faqJsonLd, safeJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

// Every industry is generated at build time. With `cacheComponents` the
// `dynamicParams` option is not available: any other slug is rendered on
// demand and `notFound()` below turns it into a 404 (the proxy guard in
// lib/route-guards.ts makes that a real 404 status).
export async function generateStaticParams() {
  return (await getIndustries()).map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getIndustryPageData(slug);
  if (!data) return {};
  const { industry } = data;
  const title = industry.seoTitle.trim() || `Software for ${industry.name}`;
  const description = industry.seoDescription.trim() || industry.tagline;
  const path = industryHref(slug);
  return buildMetadata({ title, description, path });
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const data = await getIndustryPageData(slug);
  if (!data) notFound();

  const { industry, products, count, picks, picksInRecommended, categories, articles } = data;
  const served = new Set(products.map((p) => p.slug));
  const [vendors, directory] = await Promise.all([getVendors(), getDirectoryData((p) => served.has(p.slug))]);
  const vendorNames = new Map(vendors.map((v) => [v.slug, v.name]));
  const [lede, ...rest] = industry.intro
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const faqLd = faqJsonLd(industry.faq);

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Industries", href: "/industries" },
              { label: industry.name },
            ]}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <p className="type-label">Industry</p>
              <h1 className="type-h1 mt-2 max-w-3xl text-navy">{industry.name}</h1>
            </div>
            <p className="flex items-baseline gap-2.5 border-l-2 border-navy pl-4">
              <span className="font-serif text-4xl leading-none text-navy tabular-nums">{count}</span>
              <span className="type-meta">{count === 1 ? "product serves it" : "products serve it"}</span>
            </p>
          </div>

          <div className="mt-8 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
            <div className="space-y-4">
              {lede && <p className="text-[1.125rem] leading-8 text-ink">{lede}</p>}
              {rest.map((paragraph) => (
                <p key={paragraph} className="type-body text-subtle">
                  {paragraph}
                </p>
              ))}
            </div>
            {industry.image && (
              <figure className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
                <Image
                  src={industry.image.src}
                  alt={industry.image.alt}
                  width={1200}
                  height={800}
                  priority
                  sizes="(min-width: 1024px) 38vw, 94vw"
                  className="aspect-[3/2] w-full object-cover"
                />
              </figure>
            )}
          </div>
        </Container>
      </header>

      {(industry.commonNeeds.length > 0 || categories.length > 0) && (
        <section aria-label={`${industry.name} needs and categories`} className="py-12 sm:py-16">
          <Container>
            <div className="grid gap-x-16 gap-y-12 lg:grid-cols-2">
              {industry.commonNeeds.length > 0 && (
                <div>
                  <p className="type-label mb-3">Common needs</p>
                  <h2 className="type-h2 text-navy">What software is asked to do here</h2>
                  <ul className="mt-6 divide-y divide-line border-y border-line">
                    {industry.commonNeeds.map((need) => (
                      <li key={need} className="flex gap-3.5 py-3.5">
                        <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-xs bg-blue" />
                        <span className="type-body text-ink">{need}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {categories.length > 0 && (
                <div>
                  <p className="type-label mb-3">Where to start</p>
                  <h2 className="type-h2 text-navy">Categories to look at first</h2>
                  <p className="type-body mt-3 mb-6 text-subtle">
                    Counts cover the whole directory, including subcategories. Open one to see its buying guide and
                    every product listed in it.
                  </p>
                  <RelatedCategories items={categories} />
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {count === 0 ? (
        <Container className="pb-12 sm:pb-16">
          <EmptyState
            icon={PackageSearch}
            title={`No ${industry.name} products listed yet`}
            description="We have not tagged products for this industry. Browse the full directory or a category in the meantime."
            action={
              <Link href="/software" className="text-sm font-medium text-blue-ink hover:text-navy">
                Browse all software
              </Link>
            }
          />
        </Container>
      ) : (
        <>
          {/* Skipped when the shortlist would just repeat the whole listing. */}
          {count > INDUSTRY_PICK_LIMIT && (
            <section aria-labelledby="picks-title" className="border-t border-line py-12 sm:py-16">
              <Container>
                <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
                  <div>
                    <p className="type-label mb-3">Our shortlist</p>
                    <h2 id="picks-title" className="type-h2 text-navy">
                      {picksInRecommended
                        ? `Editor's picks for ${industry.name}`
                        : `Products serving ${industry.name}`}
                    </h2>
                    <p className="type-body mt-3 text-subtle">
                      {picksInRecommended
                        ? "Chosen from the categories above that serve this industry, featured products first. "
                        : "Products from the categories above first, then other products serving this industry. "}
                      Reviews are not open yet, so this is not a ranking by user ratings and does not say a product fits
                      your organisation.
                    </p>
                  </div>
                  <TopProducts products={picks} vendorNames={vendorNames} labelledBy="picks-title" numbered={false} />
                </div>
              </Container>
            </section>
          )}

          <section aria-labelledby="listing-title" className="border-y border-line bg-surface-alt py-12 sm:py-16">
            <Container>
              <h2 id="listing-title" className="type-h2 mb-2 text-navy">
                All products serving {industry.name}
              </h2>
              <p className="type-body mb-8 max-w-2xl text-subtle">
                Filter {count} {count === 1 ? "product" : "products"} by category, pricing, company size, deployment,
                features and integrations. The listing always stays within {industry.name}.
              </p>
              <DemoDataNotice className="mb-8" />
              <DirectoryListing
                headingLevel={3}
                data={directory}
                preset={{ basePath: industryHref(slug), industryScope: { industry: slug, name: industry.name } }}
              />
            </Container>
          </section>
        </>
      )}

      {industry.selectionAdvice.length > 0 && (
        <section aria-labelledby="advice-title" className="py-12 sm:py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
              <div>
                <p className="type-label mb-3">Selection advice</p>
                <h2 id="advice-title" className="type-h2 text-navy">
                  What to check before you choose
                </h2>
                <p className="type-body mt-3 text-subtle">
                  General buying advice for {industry.name}. It is not legal, regulatory or compliance advice, and it
                  does not rate or recommend any vendor.
                </p>
              </div>
              <BuyingGuide sections={industry.selectionAdvice} />
            </div>
          </Container>
        </section>
      )}

      {articles.length > 0 && (
        <section aria-labelledby="articles-title" className="border-t border-line bg-surface-alt py-12 sm:py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
              <div>
                <p className="type-label mb-3">Related reading</p>
                <h2 id="articles-title" className="type-h2 text-navy">
                  Guides and articles
                </h2>
                <p className="type-body mt-3 text-subtle">
                  Articles about the categories above, those covering the most of them first. Where there are
                  fewer than four, one general buying guide is added.
                </p>
              </div>
              <RelatedArticles articles={articles} labelledBy="articles-title" />
            </div>
          </Container>
        </section>
      )}

      {industry.faq.length > 0 && (
        <section aria-labelledby="faq-title" className="border-t border-line py-12 sm:py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
              <div>
                <p className="type-label mb-3">Questions</p>
                <h2 id="faq-title" className="type-h2 text-navy">
                  {industry.name} FAQs
                </h2>
              </div>
              <Faq items={industry.faq} />
            </div>
          </Container>
          {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />}
        </section>
      )}
    </>
  );
}
