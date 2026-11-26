import { ArrowRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { AddProductControl } from "@/components/compare/AddProductControl";
import { CompareTable, type CompareColumn } from "@/components/compare/CompareTable";
import { ShareButton } from "@/components/compare/ShareButton";
import { productHref } from "@/components/layout/navigation";
import { ProductCompact } from "@/components/product/ProductCompact";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getComparePage, getPopularCompareSlugs } from "@/lib/compare/page-data";
import { buildMetadata } from "@/lib/seo";

// Editor-picked comparisons are generated at build time; any other valid set
// of 2 to 4 products renders on its first request and is then cached.
// proxy.ts (lib/route-guards.ts, R12) answers invalid slugs with a real 404
// and other orders with a 308 to the canonical slug before rendering starts;
// notFound() and permanentRedirect() below are defence in depth.
export async function generateStaticParams() {
  return getPopularCompareSlugs();
}

export async function generateMetadata({ params }: PageProps<"/compare/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getComparePage(slug);
  if (result.kind !== "ok") return {};
  const { title, description, path, isPopular } = result.data;
  // Only editor picks are offered to search engines (and listed in the
  // sitemap); the other combinations (hundreds of thousands) stay shareable
  // but out of the index.
  return buildMetadata({ title, description, path, noindex: !isPopular });
}

export default async function ComparisonPage({ params }: PageProps<"/compare/[slug]">) {
  const { slug } = await params;
  const result = await getComparePage(slug);
  if (result.kind === "invalid") notFound();
  if (result.kind === "redirect") permanentRedirect(`/compare/${result.canonical}`);

  const { items, groups, slugs, versusLabel, shareUrl, related, otherComparisons } = result.data;
  const columns: CompareColumn[] = items.map(({ product, vendorName, removeHref }) => ({
    slug: product.slug,
    name: product.name,
    vendorName,
    brandColor: product.brandColor,
    logo: product.logo,
    href: productHref(product.slug),
    removeHref,
  }));

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare", href: "/compare" }, { label: versusLabel }]} />
          <p className="type-label mt-6">Comparison</p>
          <h1 className="type-h1 mt-2 max-w-4xl text-navy">{versusLabel}</h1>
          <p className="type-body mt-3 max-w-2xl text-subtle">
            Side by side from public product information. Facts we could not confirm say &ldquo;Not verified&rdquo;,
            and ratings stay empty until reviews are collected.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-md">
              <AddProductControl slugs={slugs} />
            </div>
            <ShareButton url={shareUrl} />
          </div>
        </Container>
      </header>

      <Container width="wide" className="py-8 sm:py-10">
        <CompareTable columns={columns} groups={groups} />
        <DemoDataNotice className="mt-6" />
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related-alternatives" className="border-t border-line bg-surface-alt">
          <Container className="py-12 sm:py-14">
            <h2 id="related-alternatives" className="type-h2 text-navy">
              Related alternatives
            </h2>
            <p className="type-meta mt-2">Matched on categories, features, pricing model, industries and deployment, not on reviews.</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map(({ product, vendorName, addHref }) => (
                <li key={product.slug}>
                  <ProductCompact
                    product={product}
                    vendorName={vendorName}
                    compare={false}
                    actions={
                      addHref ? (
                        <Link
                          href={addHref}
                          aria-label={`Add ${product.name} to this comparison`}
                          className="inline-flex items-center gap-1 rounded-xs text-[0.8125rem] font-medium text-blue-ink hover:text-navy"
                        >
                          <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
                          Add
                        </Link>
                      ) : null
                    }
                  />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {otherComparisons.length > 0 && (
        <section aria-labelledby="other-comparisons">
          <Container className="py-12 sm:py-14">
            <h2 id="other-comparisons" className="type-h2 text-navy">
              Other comparisons
            </h2>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {otherComparisons.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="group flex items-center gap-4 rounded-xs py-4">
                    <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-navy group-hover:text-blue-ink">
                      {c.label}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
