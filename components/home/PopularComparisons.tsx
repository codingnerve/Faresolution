import { ArrowRight, Columns3 } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { compareHref } from "@/components/layout/navigation";
import { Container } from "@/components/ui/Container";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { getCategories, getPopularComparisons, getProducts, type Product } from "@/lib/data";
import { Eyebrow } from "./accents";

const ROWS = 8;

/** Editor-picked head-to-heads as paired-logo rows linking to each comparison. */
export async function PopularComparisons() {
  const [comparisons, products, categories] = await Promise.all([
    getPopularComparisons(),
    getProducts(),
    getCategories(),
  ]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

  const rows = comparisons
    .map((c) => ({
      href: compareHref(c.slugs),
      items: c.slugs.map((s) => productBySlug.get(s)).filter((p): p is Product => !!p),
      count: c.slugs.length,
    }))
    .filter((row) => row.items.length === row.count && row.count >= 2)
    .slice(0, ROWS);
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="home-compare-title" className="py-16 sm:py-20 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="type-label mb-3">
            <Eyebrow tone="coral">Editor-picked comparisons</Eyebrow>
          </p>
          <h2 id="home-compare-title" className="type-h2 text-navy">
            See the differences before the demos
          </h2>
          <p className="type-body mt-3 text-subtle">
            Put up to four products side by side: plans, deployment, platforms,
            features and integrations, with the gaps clearly marked.
          </p>
          <p className="type-meta mt-3">Starting points chosen by our editors, not ranked by traffic or reviews.</p>
          <Link
            href="/compare"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-linear-to-r from-blue-ink to-violet-ink px-4 text-sm font-medium text-white shadow-raised transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-overlay"
          >
            <Columns3 aria-hidden="true" className="size-4" strokeWidth={1.75} />
            Build your own comparison
          </Link>
        </div>

        <ul className="reveal grid border-t border-line md:grid-cols-2 md:gap-x-10">
          {rows.map((row) => {
            const names = row.items.map((p) => p.name);
            const category = categoryName.get(row.items[0].primaryCategory);
            return (
              <li key={row.href} className="border-b border-line">
                <Link
                  href={row.href}
                  className="group -mx-2 flex items-center gap-4 rounded-md px-2 py-4 transition-colors duration-200 hover:bg-blue-tint/50 sm:py-5"
                >
                  {/* Fixed width (room for three marks) keeps the names aligned. */}
                  <span aria-hidden="true" className="flex w-[5.75rem] shrink-0 items-center [perspective:400px]">
                    {row.items.map((p, i) => (
                      <span
                        key={p.slug}
                        style={{ zIndex: row.items.length - i, transitionDelay: `${i * 40}ms`, "--i": i } as CSSProperties}
                        className="-ml-2 rounded-md ring-2 ring-surface transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] first:ml-0 group-hover:[transform:translateX(calc(var(--i)*6px))_rotateY(-14deg)]"
                      >
                        <ProductLogo name={p.name} color={p.brandColor} logo={p.logo} size={28} />
                      </span>
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] leading-6 font-medium text-ink group-hover:text-blue-ink">
                      {names.map((name, i) => (
                        <span key={name}>
                          {i > 0 && <span className="font-serif text-coral-ink italic"> vs </span>}
                          {name}
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
      </Container>
    </section>
  );
}
