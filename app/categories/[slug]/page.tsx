import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyingGuide } from "@/components/categories/BuyingGuide";
import { RelatedCategories } from "@/components/categories/RelatedCategories";
import { TopProducts } from "@/components/categories/TopProducts";
import { DirectoryListing } from "@/components/directory/DirectoryPage";
import { categoryHref } from "@/components/layout/navigation";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { Faq } from "@/components/ui/Faq";
import { getCategoryPageData } from "@/lib/categories/page-data";
import { getCategories, getVendors } from "@/lib/data";
import { getDirectoryData } from "@/lib/directory/data";
import { faqJsonLd, safeJsonLd } from "@/lib/jsonld";

// Every category is generated at build time. With `cacheComponents` the
// `dynamicParams` option is not available: any other slug is rendered on
// demand and `notFound()` below turns it into a 404.
export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryPageData(slug);
  if (!data) return {};
  const { seoTitle: title, seoDescription: description } = data.category;
  const path = categoryHref(slug);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const data = await getCategoryPageData(slug);
  if (!data) notFound();

  const { category, parent, children, treeProducts, count, topProducts, related } = data;
  const treeSlugs = new Set(treeProducts.map((p) => p.slug));
  const [vendors, directory] = await Promise.all([getVendors(), getDirectoryData((p) => treeSlugs.has(p.slug))]);
  const vendorNames = new Map(vendors.map((v) => [v.slug, v.name]));
  const [lede, ...rest] = category.intro
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const crumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    ...(parent ? [{ label: parent.name, href: categoryHref(parent.slug) }] : []),
    { label: category.name },
  ];
  const faqLd = faqJsonLd(category.faq);

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={crumbs} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <p className="type-label">
                {parent ? (
                  <>
                    Subcategory of{" "}
                    <Link href={categoryHref(parent.slug)} className="rounded-xs text-blue-ink hover:text-navy">
                      {parent.name}
                    </Link>
                  </>
                ) : (
                  "Category"
                )}
              </p>
              <h1 className="type-h1 mt-2 max-w-3xl text-navy">{category.name}</h1>
            </div>
            <p className="flex items-baseline gap-2.5 border-l-2 border-navy pl-4">
              <span className="font-serif text-4xl leading-none text-navy tabular-nums">{count}</span>
              <span className="type-meta">{count === 1 ? "product listed" : "products listed"}</span>
            </p>
          </div>

          <div className="mt-8 grid gap-x-12 gap-y-5 lg:grid-cols-2">
            {lede && <p className="text-[1.125rem] leading-8 text-ink">{lede}</p>}
            {rest.length > 0 && (
              <div className="space-y-4">
                {rest.map((paragraph) => (
                  <p key={paragraph} className="type-body text-subtle">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>

          {children.length > 0 && (
            <nav aria-label={`${category.name} subcategories`} className="mt-8 border-t border-line pt-5">
              <p className="type-label mb-3">In this category</p>
              <ul className="flex flex-wrap gap-2">
                {children.map(({ category: child, count: n }) => (
                  <li key={child.slug}>
                    <Link
                      href={categoryHref(child.slug)}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong bg-surface px-3.5 text-sm font-medium text-ink hover:border-navy hover:text-navy"
                    >
                      {child.name}
                      <span className="text-subtle tabular-nums">
                        {n}
                        <span className="sr-only"> products</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Container>
      </header>

      {count === 0 ? (
        <Container className="py-12 sm:py-16">
          <EmptyState
            icon={PackageSearch}
            title={`No ${category.name} products listed yet`}
            description="We have not added products to this category. Browse the full directory or another category in the meantime."
            action={
              <Link href="/software" className="text-sm font-medium text-blue-ink hover:text-navy">
                Browse all software
              </Link>
            }
          />
        </Container>
      ) : (
        <>
          <section aria-labelledby="top-products-title" className="py-12 sm:py-16">
            <Container>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
                <div>
                  <p className="type-label mb-3">Our shortlist</p>
                  <h2 id="top-products-title" className="type-h2 text-navy">
                    Top products in {category.name}
                  </h2>
                  <p className="type-body mt-3 text-subtle">
                    Ordered by editorial pick, then by our trending order. Reviews are not open yet, so this
                    is not a ranking by user ratings.
                  </p>
                </div>
                <TopProducts products={topProducts} vendorNames={vendorNames} labelledBy="top-products-title" />
              </div>
            </Container>
          </section>

          <section aria-labelledby="listing-title" className="border-y border-line bg-surface-alt py-12 sm:py-16">
            <Container>
              <h2 id="listing-title" className="type-h2 mb-2 text-navy">
                All {category.name} products
              </h2>
              <p className="type-body mb-8 max-w-2xl text-subtle">
                Filter {count} {count === 1 ? "product" : "products"} by pricing, company size, deployment,
                industry, features and integrations.
              </p>
              <DemoDataNotice className="mb-8" />
              <DirectoryListing
                data={directory}
                preset={{ basePath: categoryHref(slug), scope: { category: slug, name: category.name } }}
              />
            </Container>
          </section>
        </>
      )}

      {category.buyingGuide.length > 0 && (
        <section aria-labelledby="guide-title" className="py-12 sm:py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
              <div>
                <p className="type-label mb-3">Buying guide</p>
                <h2 id="guide-title" className="type-h2 text-navy">
                  What to check before you choose
                </h2>
                <p className="type-body mt-3 text-subtle">
                  General advice for {category.name}. It does not rate or recommend any vendor.
                </p>
              </div>
              <BuyingGuide sections={category.buyingGuide} />
            </div>
          </Container>
        </section>
      )}

      {category.faq.length > 0 && (
        <section aria-labelledby="faq-title" className="border-t border-line py-12 sm:py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
              <div>
                <p className="type-label mb-3">Questions</p>
                <h2 id="faq-title" className="type-h2 text-navy">
                  {category.name} FAQs
                </h2>
              </div>
              <Faq items={category.faq} />
            </div>
          </Container>
          {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />}
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line bg-surface-alt py-12 sm:py-16">
          <Container>
            <h2 id="related-title" className="type-h2 mb-6 text-navy">
              Related categories
            </h2>
            <RelatedCategories items={related} />
          </Container>
        </section>
      )}
    </>
  );
}
