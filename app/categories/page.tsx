import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { categoryHref } from "@/components/layout/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getCategoryIndexData } from "@/lib/categories/page-data";
import { buildMetadata } from "@/lib/seo";

const title = "Software categories";
const description =
  "Browse business software by category and subcategory. Each category has a buying guide, a shortlist and every product we list in it.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/categories" });

const productCount = (n: number) => `${n} ${n === 1 ? "product" : "products"}`;

export default async function CategoriesPage() {
  const roots = await getCategoryIndexData();
  const withChildren = roots.filter((r) => r.children.length > 0);
  const standalone = roots.filter((r) => r.children.length === 0);
  const subcategories = roots.reduce((n, r) => n + r.children.length, 0);

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />
          <p className="type-label mt-6">Category index</p>
          <h1 className="type-h1 mt-2 max-w-3xl text-navy">Software categories</h1>
          <p className="type-body mt-3 max-w-2xl text-subtle">
            {roots.length} categories and {subcategories} subcategories. A category page lists the products in it
            together with its subcategories, and explains what to check before you choose.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/software"
              className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
            >
              Browse all software
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <DemoDataNotice className="mb-10" />
        <ol className="border-t-2 border-navy">
          {withChildren.map(({ category, count, children }) => (
            <li
              key={category.slug}
              className="grid gap-x-12 gap-y-4 border-b border-line py-7 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:py-8"
            >
              <div className="min-w-0">
                <h2 className="type-h2 text-navy">
                  <Link href={categoryHref(category.slug)} className="rounded-xs hover:text-blue-ink">
                    {category.name}
                  </Link>
                </h2>
                <p className="type-meta mt-1 tabular-nums">{productCount(count)}</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-ink">{category.seoDescription}</p>
              </div>
              <div className="min-w-0 lg:pt-1.5">
                <p className="type-label mb-2">Subcategories</p>
                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {children.map(({ category: child, count: n }) => (
                    <li key={child.slug} className="border-t border-line first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                      <Link
                        href={categoryHref(child.slug)}
                        className="flex items-baseline justify-between gap-3 rounded-xs py-2.5 text-ink hover:text-blue-ink"
                      >
                        <span className="font-medium">{child.name}</span>
                        <span className="text-sm text-subtle tabular-nums">
                          {n}
                          <span className="sr-only"> products</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        {standalone.length > 0 && (
          <section aria-labelledby="standalone-title" className="mt-12">
            <h2 id="standalone-title" className="type-h2 text-navy">
              More categories
            </h2>
            <p className="type-body mt-2 max-w-2xl text-subtle">Categories without subcategories.</p>
            <ul className="mt-5 grid gap-x-10 border-t-2 border-navy sm:grid-cols-2 lg:grid-cols-3">
              {standalone.map(({ category, count }) => (
                <li key={category.slug} className="border-b border-line">
                  <Link
                    href={categoryHref(category.slug)}
                    className="flex items-baseline justify-between gap-4 rounded-xs py-3.5 text-ink hover:text-blue-ink"
                  >
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-subtle tabular-nums">{productCount(count)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="type-meta mt-6 max-w-2xl">
          Counts include products in subcategories, and a product tagged with several categories is counted once
          in each category it appears in.
        </p>
      </Container>
    </>
  );
}
