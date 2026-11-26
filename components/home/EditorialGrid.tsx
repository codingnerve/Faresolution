import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { articleHref, articleIndexHref } from "@/components/layout/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getArticles, getAuthor, type Article, type ArticleKind } from "@/lib/data";
import { ARTICLE_KIND_LABEL, formatArticleDate } from "@/lib/editorial";
import { cn } from "@/lib/utils";

const KINDS = ["buying-guide", "research"] as const satisfies readonly ArticleKind[];
const MAX_ARTICLES = 5;

const KIND_RULE: Record<(typeof KINDS)[number], string> = {
  "buying-guide": "bg-blue",
  research: "bg-violet",
};

type EditorialKind = (typeof KINDS)[number];
type Item = Article & { kind: EditorialKind; authorName: string | null };

const isEditorialKind = (kind: ArticleKind): kind is EditorialKind =>
  (KINDS as readonly ArticleKind[]).includes(kind);

function Meta({ item, className }: { item: Item; className?: string }) {
  const published = formatArticleDate(item.publishedAt);
  return (
    <p className={cn("type-meta flex flex-wrap items-center gap-x-2", className)}>
      {item.authorName && <span>{item.authorName}</span>}
      {item.authorName && published && <span aria-hidden="true">&middot;</span>}
      {published && <time dateTime={item.publishedAt}>{published}</time>}
    </p>
  );
}

function KindLabel({ kind }: { kind: EditorialKind }) {
  return (
    <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-subtle uppercase">
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-xs", KIND_RULE[kind])} />
      {ARTICLE_KIND_LABEL[kind]}
    </span>
  );
}

/** Latest buying guides and research, newest first: one lead story and a list. */
export async function EditorialGrid() {
  const articles = await getArticles();
  // getArticles() is grouped by kind, so sort explicitly by date.
  const latest = articles
    .filter((a): a is Article & { kind: EditorialKind } => isEditorialKind(a.kind))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_ARTICLES);
  if (latest.length === 0) return null;

  const items: Item[] = await Promise.all(
    latest.map(async (a) => ({ ...a, authorName: (await getAuthor(a.authorSlug))?.name ?? null })),
  );
  const [lead, ...rest] = items;

  return (
    <section aria-labelledby="home-editorial-title" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <SectionHeader
          id="home-editorial-title"
          eyebrow="Guides and research"
          title="Read before you sign"
          description="Practical buying guides and research on choosing, evaluating and switching business software."
          action={
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href={articleIndexHref["buying-guide"]}
                className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
              >
                All buying guides
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </Link>
              <Link href={articleIndexHref.research} className="rounded-xs text-sm font-medium text-ink hover:text-navy">
                All research
              </Link>
            </div>
          }
        />

        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <article className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface-alt lg:self-start">
            {lead.cover && (
              <div className="border-b border-line bg-surface">
                <Image
                  src={lead.cover.src}
                  alt={lead.cover.alt}
                  width={1600}
                  height={900}
                  sizes="(min-width: 1024px) 48vw, 94vw"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-10">
              <KindLabel kind={lead.kind} />
              <h3 className="mt-5 font-serif text-[1.75rem] leading-[1.15] font-[440] tracking-[-0.015em] text-balance text-navy sm:text-[2.25rem]">
                <Link
                  href={articleHref(lead.kind, lead.slug)}
                  className="rounded-xs after:absolute after:inset-0 after:rounded-lg group-hover:text-blue-ink"
                >
                  {lead.title}
                </Link>
              </h3>
              <p className="type-body mt-4 max-w-xl text-subtle">{lead.excerpt}</p>
              <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                <Meta item={lead} />
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-ink" aria-hidden="true">
                  Read
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
                </span>
              </div>
            </div>
          </article>

          {rest.length > 0 && (
            <ul className="border-t border-line">
              {rest.map((item) => (
                <li key={`${item.kind}/${item.slug}`} className="border-b border-line">
                  <article className="group relative flex items-start gap-4 py-5 sm:py-6">
                    <div className="min-w-0 flex-1">
                      <KindLabel kind={item.kind} />
                      <h3 className="mt-2.5 text-[1.0625rem] leading-6 font-semibold tracking-[-0.01em] text-navy">
                        <Link
                          href={articleHref(item.kind, item.slug)}
                          className="rounded-xs after:absolute after:inset-0 group-hover:text-blue-ink"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <Meta item={item} className="mt-2" />
                    </div>
                    {item.cover && (
                      <Image
                        src={item.cover.src}
                        alt=""
                        aria-hidden="true"
                        width={1600}
                        height={900}
                        sizes="112px"
                        className="mt-1 aspect-[16/9] w-24 shrink-0 rounded-sm border border-line object-cover sm:w-28"
                      />
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
