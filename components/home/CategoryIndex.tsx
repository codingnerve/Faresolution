import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { allCategoriesLink, categoryHref } from "@/components/layout/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCategories, getCategoryTree, getProductsInCategoryTree } from "@/lib/data";
import { cn } from "@/lib/utils";
import { accentAt, Eyebrow } from "./accents";

// Static class names so Tailwind can see them. The closing cell fills the last row.
const SM_SPAN = { 1: "sm:col-span-1", 2: "sm:col-span-2" } as const;
const LG_SPAN = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3" } as const;
const fillSpan = (items: number, cols: number) => cols - (items % cols);

/** Typographic index of every top-level category with its subcategories and listing counts. */
export async function CategoryIndex() {
  const [tree, categories] = await Promise.all([getCategoryTree(), getCategories()]);
  // Shared rule with the category pages: a category's listing includes its
  // subcategories, each product counted once.
  const counts = new Map(
    await Promise.all(
      categories.map(async (c) => [c.slug, (await getProductsInCategoryTree(c.slug)).length] as const),
    ),
  );
  const count = (slug: string) => counts.get(slug) ?? 0;
  const subcategoryCount = tree.reduce((n, root) => n + root.children.length, 0);

  return (
    <section aria-labelledby="home-categories-title" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <SectionHeader
          id="home-categories-title"
          eyebrow={<Eyebrow tone="blue">Category index</Eyebrow>}
          title="Start from the job you need done"
          description={`${tree.length} categories and ${subcategoryCount} subcategories, each with a buying guide and the products we list in it.`}
          action={
            <Link
              href={allCategoriesLink.href}
              className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
            >
              All categories
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
          }
        />

        <ul className="reveal mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {tree.map((root, index) => {
            const total = count(root.slug);
            const a = accentAt(index);
            return (
              <li key={root.slug} className={cn("group/cell relative flex flex-col bg-surface p-5 transition-colors duration-300 sm:p-6", a.hoverTint)}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 origin-left scale-x-[0.14] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cell:scale-x-100",
                    a.solid,
                  )}
                />
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={categoryHref(root.slug)}
                    className="rounded-xs text-[1.0625rem] leading-6 font-semibold tracking-[-0.01em] text-navy hover:text-blue-ink"
                  >
                    {root.name}
                  </Link>
                  <span className="flex shrink-0 flex-col items-end">
                    <span className={cn("font-serif text-[1.75rem] leading-none tabular-nums transition-transform duration-300 group-hover/cell:-translate-y-0.5", a.ink)}>{total}</span>
                    <span className="mt-1 text-[0.6875rem] font-medium tracking-[0.06em] text-subtle uppercase">
                      {total === 1 ? "product" : "products"}
                    </span>
                  </span>
                </div>
                {root.children.length > 0 && (
                  <ul className={cn("mt-4 space-y-1.5 border-l-2 pl-3", a.rule)}>
                    {root.children.map((child) => (
                      <li key={child.slug} className="flex items-baseline justify-between gap-3 text-[0.8125rem] leading-5">
                        <Link href={categoryHref(child.slug)} className="rounded-xs text-ink hover:text-blue-ink hover:underline hover:decoration-line-strong hover:underline-offset-4">
                          {child.name}
                        </Link>
                        <span className="text-subtle tabular-nums">
                          {count(child.slug)}
                          <span className="sr-only"> products</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          <li
            className={cn(
              "flex flex-col justify-between gap-6 bg-linear-to-br from-blue-tint via-violet-tint to-coral-tint p-5 sm:p-6",
              SM_SPAN[fillSpan(tree.length, 2) as 1 | 2],
              LG_SPAN[fillSpan(tree.length, 3) as 1 | 2 | 3],
            )}
          >
            <div>
              <p className="type-h3 text-navy">Not sure where your need fits?</p>
              <p className="type-body mt-2 max-w-md text-sm leading-6 text-subtle">
                Browse the full directory with filters for pricing model,
                company size, deployment and industry.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/software" className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy">
                Browse all software
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </Link>
              <Link href="/software/free" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
                Software with a free plan
              </Link>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  );
}
