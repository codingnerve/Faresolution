import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/editorial/cards";
import { RelatedArticles } from "@/components/industries/RelatedArticles";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getArticle, getArticles, getAuthor, type Article } from "@/lib/data";
import { ARTICLE_KINDS, ARTICLE_SECTIONS, articleHref, articleIndexHref, sortByNewest, toArticleCard } from "@/lib/editorial";
import { buildMetadata } from "@/lib/seo";

const title = "Resources";
const description =
  "Guides, buying guides, editor shortlists and research from Faresolution on choosing, buying and rolling out business software.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/resources" });

const LATEST_LIMIT = 5;

export default async function ResourcesPage() {
  const [all, methodology] = await Promise.all([
    getArticles(),
    getArticle("research", "how-faresolution-handles-product-facts-and-reviews"),
  ]);
  const newest = sortByNewest(all);
  const latest = newest.slice(0, LATEST_LIMIT);
  const featured = await Promise.all(
    newest
      .filter((a) => a.featured)
      .map(async (a: Article) => toArticleCard(a, (await getAuthor(a.authorSlug))?.name ?? null)),
  );
  const sections = ARTICLE_KINDS.map((kind) => ({
    kind,
    ...ARTICLE_SECTIONS[kind],
    href: articleIndexHref[kind],
    count: all.filter((a) => a.kind === kind).length,
  }));

  const process = [
    ...(methodology
      ? [
          {
            label: "How we handle product facts",
            href: articleHref(methodology.kind, methodology.slug),
            text: "What the directory records, what it leaves blank and why every listing is marked unverified.",
          },
        ]
      : []),
    {
      label: "Review guidelines",
      href: "/review-guidelines",
      text: "The rules that will apply to reviews once collection opens. No reviews have been collected yet.",
    },
    {
      label: "How reviewers will be verified",
      href: "/review-verification",
      text: "The plan for confirming that reviewers use the product. Not in operation yet.",
    },
    {
      label: "Software buying guides",
      href: articleIndexHref["buying-guide"],
      text: "What to settle before you buy a type of software, and what to ask the vendor.",
    },
  ];

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Resources" }]} />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <p className="type-label">Read before you choose</p>
              <h1 className="type-h1 mt-2 text-navy">Resources</h1>
              <p className="mt-4 max-w-[46rem] text-[1.125rem] leading-8 text-pretty text-ink">
                Practical writing from the Faresolution editors on choosing, buying and rolling out business software.
                Each piece says what it is based on. Shortlists explain their criteria and are not rankings: no user
                reviews have been collected yet, and no product has been tested hands-on.
              </p>
            </div>
            <p className="flex items-baseline gap-2.5 border-l-2 border-navy pl-4">
              <span className="font-serif text-4xl leading-none text-navy tabular-nums">{all.length}</span>
              <span className="type-meta">{all.length === 1 ? "piece published" : "pieces published"}</span>
            </p>
          </div>
        </Container>
      </header>

      <section aria-labelledby="resources-sections-title" className="py-12 sm:py-16">
        <Container>
          <p className="type-label mb-2">Sections</p>
          <h2 id="resources-sections-title" className="type-h2 text-navy">
            Five ways in
          </h2>
          <ul className="mt-8 border-t border-line">
            {sections.map((s) => (
              <li key={s.kind} className="border-b border-line">
                <Link
                  href={s.href}
                  className="group grid gap-x-10 gap-y-2 rounded-xs py-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] sm:items-baseline"
                >
                  <span className="font-serif text-[1.5rem] leading-tight font-[460] text-navy group-hover:text-blue-ink">
                    {s.title}
                  </span>
                  <span className="type-body max-w-[46rem] text-subtle">{s.description}</span>
                  <span className="flex items-center gap-2 text-sm whitespace-nowrap text-subtle tabular-nums">
                    {s.count} {s.count === 1 ? s.nouns.one : s.nouns.other}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-ink"
                      strokeWidth={1.75}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="resources-featured-title" className="border-t border-line bg-surface-alt py-12 sm:py-16">
          <Container>
            <p className="type-label mb-2">Editors&apos; selection</p>
            <h2 id="resources-featured-title" className="type-h2 text-navy">
              Featured pieces
            </h2>
            <p className="type-body mt-3 max-w-2xl text-subtle">
              Starting points chosen by the editors. Featured is an editorial choice, not a
              measure of readership.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <li key={`${item.kind}/${item.slug}`}>
                  <ArticleCard item={item} label="kind" />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section aria-label="Recent pieces and editorial standards" className="border-t border-line py-12 sm:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
            {latest.length > 0 && (
              <div>
                <p className="type-label mb-2">Newest first</p>
                <h2 id="resources-latest-title" className="type-h2 mb-6 text-navy">
                  Recently published
                </h2>
                <RelatedArticles articles={latest} labelledBy="resources-latest-title" />
              </div>
            )}
            <div>
              <p className="type-label mb-2">How we work</p>
              <h2 id="resources-process-title" className="type-h2 mb-6 text-navy">
                Standards and methods
              </h2>
              <ul aria-labelledby="resources-process-title" className="divide-y divide-line rounded-lg border border-line">
                {process.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="group block rounded-lg p-5 hover:bg-surface-alt">
                      <span className="flex items-center justify-between gap-3 font-medium text-navy group-hover:text-blue-ink">
                        {item.label}
                        <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted group-hover:text-blue-ink" strokeWidth={1.75} />
                      </span>
                      <span className="type-meta mt-1 block">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
