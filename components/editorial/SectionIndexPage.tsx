import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getArticles, getAuthor, type ArticleKind } from "@/lib/data";
import { ARTICLE_SECTIONS, articleIndexHref, categoryLabels, pickLead, toArticleCard } from "@/lib/editorial";
import { SITE_NAME } from "@/lib/utils";
import { ArticleIndex } from "./ArticleIndex";

/** Metadata for an editorial index page, from the section's own description. */
export function sectionMetadata(kind: ArticleKind): Metadata {
  const { title, description } = ARTICLE_SECTIONS[kind];
  const path = articleIndexHref[kind];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, url: path, title, description },
  };
}

/**
 * An editorial section: what it is, then its articles (lead story and grid)
 * with topic chips and a title search.
 */
export async function SectionIndexPage({ kind }: { kind: ArticleKind }) {
  const section = ARTICLE_SECTIONS[kind];
  const { lead, rest } = pickLead(await getArticles(kind));
  const toCard = async (a: NonNullable<typeof lead>) => toArticleCard(a, (await getAuthor(a.authorSlug))?.name ?? null);
  const [leadCard, restCards] = await Promise.all([lead ? toCard(lead) : null, Promise.all(rest.map(toCard))]);
  const count = (lead ? 1 : 0) + rest.length;
  const labels = categoryLabels(leadCard ? [leadCard, ...restCards] : restCards);

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: section.title },
            ]}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div className="min-w-0">
              <p className="type-label">Resources</p>
              <h1 className="type-h1 mt-2 text-navy">{section.title}</h1>
              <p className="mt-4 max-w-[44rem] text-[1.125rem] leading-8 text-pretty text-ink">{section.description}</p>
            </div>
            <p className="flex items-baseline gap-2.5 border-l-2 border-navy pl-4">
              <span className="font-serif text-4xl leading-none text-navy tabular-nums">{count}</span>
              <span className="type-meta">{count === 1 ? `${section.nouns.one} published` : `${section.nouns.other} published`}</span>
            </p>
          </div>
        </Container>
      </header>

      <section aria-label={`All ${section.nouns.other}`} className="py-10 sm:py-14">
        <Container>
          <ArticleIndex lead={leadCard} rest={restCards} labels={labels} nouns={section.nouns} />
        </Container>
      </section>
    </>
  );
}
