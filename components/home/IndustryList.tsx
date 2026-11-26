import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { allIndustriesLink, industryHref } from "@/components/layout/navigation";
import { Container } from "@/components/ui/Container";
import { getIndustries, getProducts } from "@/lib/data";

/** Industries as a numbered typographic list on navy. */
export async function IndustryList() {
  const [industries, products] = await Promise.all([getIndustries(), getProducts()]);
  if (industries.length === 0) return null;
  const count = (slug: string) => products.filter((p) => p.industrySlugs.includes(slug)).length;

  return (
    <section aria-labelledby="home-industries-title" className="on-dark relative isolate overflow-hidden bg-navy py-16 text-white sm:py-20 lg:py-24">
      <div aria-hidden="true" className="depth-grid -z-10 [--grid-line:rgb(255_255_255/0.07)]" />
      <Container className="relative">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-blue-light uppercase">Industries</p>
            <h2 id="home-industries-title" className="type-h2 text-white">
              Software choices shaped by the work you do
            </h2>
            <p className="type-body mt-3 text-white/70">
              Clinics, contractors and law firms ask different questions of the
              same tools. Each industry page covers common needs, selection
              advice and the categories to look at first.
            </p>
          </div>
          <Link
            href={allIndustriesLink.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xs text-sm font-medium text-white hover:text-blue-light"
          >
            {allIndustriesLink.label}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>

        <ol className="reveal-stagger mt-12 grid border-t border-white/12 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
          {industries.map((industry, index) => {
            const n = count(industry.slug);
            return (
              <li key={industry.slug} className="border-b border-white/12">
                <Link href={industryHref(industry.slug)} className="group flex gap-4 rounded-xs py-5">
                  <span aria-hidden="true" className="w-6 shrink-0 pt-1.5 font-mono text-xs text-blue-light tabular-nums transition-transform duration-300 group-hover:translate-x-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-serif text-[1.5rem] leading-tight text-white transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-blue-light">
                        {industry.name}
                      </span>
                      <span className="shrink-0 text-xs text-white/60 tabular-nums">
                        {n} {n === 1 ? "product" : "products"}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] leading-5 text-white/70">{industry.tagline}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
