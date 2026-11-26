import { ArrowRight, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlternativeCard } from "@/components/alternatives/AlternativeCard";
import { CompareButton } from "@/components/compare/CompareButton";
import { categoryHref, productHref } from "@/components/layout/navigation";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { LogoMark } from "@/components/ui/LogoMark";
import { getAlternativesPage, getAlternativesParams } from "@/lib/alternatives/page-data";
import { itemListJsonLd, safeJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

// Every product gets an alternatives page at build time. Unknown slugs get a
// real 404 from proxy.ts (lib/route-guards.ts, R12); `notFound()` below is
// defence in depth.
export async function generateStaticParams() {
  return getAlternativesParams();
}

export async function generateMetadata({ params }: PageProps<"/alternatives/[product]">): Promise<Metadata> {
  const { product: slug } = await params;
  const data = await getAlternativesPage(slug);
  if (!data) return {};
  const path = `/alternatives/${slug}`;
  const { title, description } = data;
  return buildMetadata({ title, description, path });
}

export default async function AlternativesPage({ params }: PageProps<"/alternatives/[product]">) {
  const { product: slug } = await params;
  const data = await getAlternativesPage(slug);
  if (!data) notFound();

  const { product, vendor, category, alternatives, vendorNames } = data;
  const crumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Alternatives", href: "/alternatives" },
    { label: product.name },
  ];
  const listLd = itemListJsonLd(alternatives.map((a) => ({ name: a.product.name, path: productHref(a.product.slug) })));

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={crumbs} />
          <p className="type-label mt-6">Alternatives</p>
          <h1 className="type-h1 mt-2 max-w-3xl text-navy">Alternatives to {product.name}</h1>
          <p className="type-body mt-3 max-w-2xl text-subtle">
            Products similar to {product.name}
            {category ? ` (listed under ${category.name})` : ""}, matched on shared categories, distinctive features,
            pricing model, industries and deployment. They are listed by how much they have in common with {product.name}, most similar first.
            This is not a ranking by ratings or popularity, and no ratings or reviews have been collected yet.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
            <LogoMark name={product.name} color={product.brandColor} size={48} className="shrink-0" />
            <div className="min-w-0 flex-1 basis-56">
              <p className="type-label">Looking for alternatives to</p>
              <p className="mt-0.5 text-lg leading-6 font-semibold text-navy">{product.name}</p>
              {vendor && <p className="type-meta">by {vendor.name}</p>}
              <p className="mt-1.5 text-sm leading-5 text-ink">{product.tagline}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={productHref(product.slug)} className={buttonClasses({ variant: "secondary", size: "sm" })}>
                View profile
              </Link>
              <CompareButton slug={product.slug} name={product.name} />
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <DemoDataNotice className="mb-8" />
        {alternatives.length > 0 ? (
          <section aria-labelledby="alternatives-title">
            <h2 id="alternatives-title" className="type-h2 mb-6 text-navy">
              {alternatives.length} {alternatives.length === 1 ? "alternative" : "alternatives"} to {product.name}
            </h2>
            <ul className="space-y-4">
              {alternatives.map((alternative) => (
                <li key={alternative.product.slug}>
                  <AlternativeCard
                    alternative={alternative}
                    vendorName={vendorNames.get(alternative.product.vendorSlug) ?? null}
                    source={{ slug: product.slug, name: product.name }}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No alternatives listed yet"
            description={`We have not found products similar to ${product.name} in the catalogue yet.`}
            action={
              <Link href="/software" className="text-sm font-medium text-blue-ink hover:text-navy">
                Browse all software
              </Link>
            }
          />
        )}

        <nav aria-label="Keep browsing" className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
          {category && (
            <Link
              href={categoryHref(category.slug)}
              className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
            >
              Browse the {category.name} category
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
          )}
          <Link
            href="/alternatives"
            className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
          >
            Alternatives to other products
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </nav>
      </Container>
      {listLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(listLd) }} />}
    </>
  );
}
