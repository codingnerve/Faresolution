import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { industryHref } from "@/components/layout/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getIndustryIndexData } from "@/lib/industries/page-data";
import { buildMetadata } from "@/lib/seo";

const title = "Software by industry";
const description =
  "Business software shaped by the work you do. Pick an industry for common needs, selection advice, the categories to start with and the products that serve it.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/industries" });

/** Industry index: one editorial row per industry, large numeral first, the whole row is the link. */
export default async function IndustriesPage() {
  const entries = await getIndustryIndexData();

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Industries" }]} />
          <p className="type-label mt-6">Industry index</p>
          <h1 className="type-h1 mt-2 max-w-3xl text-navy">Software by industry</h1>
          <p className="type-body mt-3 max-w-2xl text-subtle">
            A clinic, a contractor and a law firm ask different questions of the same tools. Each of the{" "}
            {entries.length} industry pages explains what software is typically asked to do there, what to check
            before you choose and which categories to look at first.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
            >
              Browse by category instead
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
            <Link href="/software" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
              All software
            </Link>
          </div>
        </Container>
      </header>

      <section aria-labelledby="industry-list-title" className="py-10 sm:py-14">
        <Container>
          <h2 id="industry-list-title" className="sr-only">
            All industries
          </h2>
          <DemoDataNotice className="mb-8" />
          <ol className="border-t border-line">
            {entries.map(({ industry, count, categories }, index) => (
              <li key={industry.slug} className="border-b border-line">
                <article className="group relative grid gap-x-8 gap-y-3 py-6 sm:py-8 md:grid-cols-[4.5rem_minmax(0,5fr)_minmax(0,4fr)] lg:grid-cols-[6rem_minmax(0,5fr)_minmax(0,4fr)] lg:gap-x-12">
                  {/* From md the numeral has its own column; below md it sits inline before the name. */}
                  <span
                    aria-hidden="true"
                    className="hidden font-serif text-5xl leading-none text-line-strong tabular-nums transition-colors group-hover:text-blue-ink md:block lg:text-6xl"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="flex items-baseline gap-3 font-serif text-[1.75rem] leading-tight font-[440] tracking-[-0.015em] text-navy sm:text-[2rem]">
                      <span
                        aria-hidden="true"
                        className="text-[1.75rem] text-line-strong tabular-nums transition-colors group-hover:text-blue-ink sm:text-[2rem] md:hidden"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Link
                        href={industryHref(industry.slug)}
                        className="rounded-xs after:absolute after:inset-0 group-hover:text-blue-ink"
                      >
                        {industry.name}
                      </Link>
                    </h3>
                    <p className="type-body mt-2 max-w-xl text-subtle">{industry.tagline}</p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-start">
                    <p className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl leading-none text-navy tabular-nums">{count}</span>
                      <span className="type-meta">{count === 1 ? "product serves it" : "products serve it"}</span>
                    </p>
                    {categories.length > 0 && (
                      <p className="text-sm leading-6 text-subtle">
                        <span className="font-medium text-ink">Start with </span>
                        {categories.map((c) => c.name).join(", ")}
                      </p>
                    )}
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-blue-ink"
                    >
                      See products and advice
                      <ArrowRight
                        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
