import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ComparePicker } from "@/components/compare/ComparePicker";
import { compareHref } from "@/components/layout/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { LogoMark } from "@/components/ui/LogoMark";
import { getCategories, getPopularComparisons, getProducts, type Product } from "@/lib/data";
import { MAX_COMPARE } from "@/lib/compare/slug";
import { buildMetadata } from "@/lib/seo";

const title = "Compare software side by side";
const description = `Pick up to ${MAX_COMPARE} products and compare pricing model, free plan and trial, features, deployment, platforms and integrations side by side.`;

export const metadata: Metadata = buildMetadata({ title, description, path: "/compare" });

export default async function ComparePage() {
  const [comparisons, products, categories] = await Promise.all([getPopularComparisons(), getProducts(), getCategories()]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const popular = comparisons
    .map((c) => ({ href: compareHref(c.slugs), items: c.slugs.map((s) => productBySlug.get(s)) }))
    .filter((c): c is { href: string; items: Product[] } => c.items.every((p) => p !== undefined));

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
            <div className="min-w-0">
              <p className="type-label">Compare</p>
              <h1 className="type-h1 mt-2 max-w-3xl text-navy">Compare software side by side</h1>
              <p className="type-body mt-3 max-w-2xl text-subtle">
                Choose two to {MAX_COMPARE} products to see their pricing model, free plan and trial, features, deployment,
                platforms and integrations in one table, with the differences marked. The facts come from public product
                information we have not yet verified with vendors; anything we could not confirm says &ldquo;Not
                verified&rdquo;, and ratings appear only once reviews are collected.
              </p>
            </div>
            <figure className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
              <Image
                src="/images/sections/compare-hero.webp"
                alt="Three aligned vertical columns with horizontal comparison bars in navy, blue, and violet."
                width={1600}
                height={1000}
                priority
                sizes="(min-width: 1024px) 38vw, 94vw"
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <ComparePicker />
        <p className="type-meta mt-4">
          You can also add products with the Compare button on any listing or product page. Your selection is kept in
          this browser only.
        </p>

        {popular.length > 0 && (
          <section aria-labelledby="editor-picked-comparisons" className="mt-14 sm:mt-16">
            <h2 id="editor-picked-comparisons" className="type-h2 text-navy">
              Editor-picked comparisons
            </h2>
            <p className="type-meta mt-2">Starting points chosen by our editors, not ranked by traffic or reviews.</p>
            <ul className="mt-6 grid border-t border-line md:grid-cols-2 md:gap-x-10">
              {popular.map(({ href, items }) => {
                const category = categoryName.get(items[0].primaryCategory);
                return (
                  <li key={href} className="border-b border-line">
                    <Link href={href} className="group flex items-center gap-4 rounded-xs py-4">
                      <span aria-hidden="true" className="flex w-[5.75rem] shrink-0 items-center gap-1">
                        {items.map((p) => (
                          <LogoMark key={p.slug} name={p.name} color={p.brandColor} size={28} />
                        ))}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.9375rem] leading-6 font-medium text-ink group-hover:text-blue-ink">
                          {items.map((p, i) => (
                            <span key={p.slug}>
                              {i > 0 && <span className="font-serif text-subtle italic"> vs </span>}
                              {p.name}
                            </span>
                          ))}
                        </span>
                        {category && <span className="type-meta block">{category}</span>}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-blue-ink"
                        strokeWidth={2}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <DemoDataNotice className="mt-12" />
      </Container>
    </>
  );
}
