import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RelatedCategories } from "@/components/categories/RelatedCategories";
import { ProductCompact } from "@/components/product/ProductCompact";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import type { CategoryCount } from "@/lib/categories/page-data";
import {
  getArticle,
  getArticles,
  getAuthor,
  getCategory,
  getProduct,
  getProductsInCategoryTree,
  getVendors,
  type ArticleKind,
  type Product,
} from "@/lib/data";
import {
  ARTICLE_KIND_LABEL,
  ARTICLE_PAGE_IDS,
  ARTICLE_SECTIONS,
  articleHref,
  articleIndexHref,
  articleTitle,
  buildToc,
  formatArticleDate,
  readingTime,
  relatedArticles,
  toArticleCard,
} from "@/lib/editorial";
import { articleJsonLd, safeJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { ArticleBody } from "./ArticleBody";
import { AuthorCard, AuthorMonogram } from "./AuthorCard";
import { ArticleCard } from "./cards";
import { ShareLinks } from "./ShareLinks";
import { TableOfContents } from "./TableOfContents";

/** Every article of a kind, for `generateStaticParams` (each kind has at least one). */
export async function articleStaticParams(kind: ArticleKind): Promise<{ slug: string }[]> {
  return (await getArticles(kind)).map((a) => ({ slug: a.slug }));
}

/**
 * Short page title (seoTitle when the headline is too long for the template,
 * R13), description from the excerpt, canonical URL and Open Graph article
 * data. Social cards use the full headline.
 */
export async function articleMetadata(kind: ArticleKind, slug: string): Promise<Metadata> {
  const article = await getArticle(kind, slug);
  if (!article) return {};
  const author = await getAuthor(article.authorSlug);
  return buildMetadata({
    title: articleTitle(article),
    ogTitle: article.title,
    description: article.excerpt,
    path: articleHref(kind, slug),
    type: "article",
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.categoryLabel,
      authors: author ? [author.name] : [],
    },
  });
}

function DateLine({ label, iso }: { label: string; iso: string }) {
  const text = formatArticleDate(iso);
  if (!text) return null;
  return (
    <span>
      {label} <time dateTime={iso}>{text}</time>
    </span>
  );
}

export async function ArticlePage({ kind, slug }: { kind: ArticleKind; slug: string }) {
  const article = await getArticle(kind, slug);
  if (!article) notFound();

  const [author, all, vendors] = await Promise.all([getAuthor(article.authorSlug), getArticles(), getVendors()]);
  const products = (await Promise.all(article.relatedProductSlugs.map((s) => getProduct(s)))).filter(
    (p): p is Product => p !== null,
  );
  const categories = (
    await Promise.all(
      article.relatedCategorySlugs.map(async (s): Promise<CategoryCount | null> => {
        const category = await getCategory(s);
        return category ? { category, count: (await getProductsInCategoryTree(s)).length } : null;
      }),
    )
  ).filter((c): c is CategoryCount => c !== null);
  const related = await Promise.all(
    relatedArticles(article, all).map(async (a) => toArticleCard(a, (await getAuthor(a.authorSlug))?.name ?? null)),
  );

  const vendorNames = new Map(vendors.map((v) => [v.slug, v.name]));
  const section = ARTICLE_SECTIONS[kind];
  const sectionHref = articleIndexHref[kind];
  const path = articleHref(kind, slug);
  const toc = buildToc(article.body);
  const minutes = readingTime(article.body);
  const updated = article.updatedAt !== article.publishedAt;
  // Skip a category label that only repeats the section ("Best software", "Buying guide").
  const label = article.categoryLabel.trim().toLowerCase();
  const showCategory =
    label !== "" && label !== section.title.toLowerCase() && label !== ARTICLE_KIND_LABEL[kind].toLowerCase();

  return (
    <article>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: section.title, href: sectionHref },
              { label: article.title },
            ]}
          />
          <div className="mt-8 max-w-[48rem] sm:mt-10 lg:ml-[calc(14rem+4rem)] xl:ml-[calc(14rem+6rem)]">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link
                href={sectionHref}
                className="inline-flex items-center gap-2 rounded-xs text-xs font-semibold tracking-[0.08em] text-blue-ink uppercase hover:text-navy"
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-xs bg-blue" />
                {section.title}
              </Link>
              {showCategory && (
                <>
                  <span aria-hidden="true" className="text-muted">
                    /
                  </span>
                  <span className="type-label">{article.categoryLabel}</span>
                </>
              )}
            </p>
            <h1 className="mt-5 font-serif text-[2.125rem] leading-[1.08] font-[420] tracking-[-0.022em] text-balance text-navy sm:text-[2.875rem] lg:text-[3.25rem]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-[42rem] font-serif text-[1.25rem] leading-[1.5] text-pretty text-ink/85 sm:text-[1.375rem]">
              {article.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-6">
              {author && (
                <div className="flex items-center gap-3">
                  <AuthorMonogram name={author.name} avatar={author.avatar} size="sm" />
                  <div className="text-sm leading-5">
                    <p className="font-medium text-ink">{author.name}</p>
                    <p className="text-subtle">{author.role}</p>
                  </div>
                </div>
              )}
              <p className="type-meta flex flex-wrap items-center gap-x-2 gap-y-1">
                <DateLine label="Published" iso={article.publishedAt} />
                {updated && formatArticleDate(article.updatedAt) && (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <DateLine label="Updated" iso={article.updatedAt} />
                  </>
                )}
                <span aria-hidden="true">&middot;</span>
                <span>{minutes} min read</span>
              </p>
            </div>
            {article.cover && (
              <figure className="mt-8 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
                <Image
                  src={article.cover.src}
                  alt={article.cover.alt}
                  width={1600}
                  height={900}
                  priority
                  sizes="(min-width: 1024px) 48rem, 94vw"
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            )}
          </div>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          <aside className={toc.length === 0 ? "hidden lg:block" : undefined}>
            <TableOfContents entries={toc} />
          </aside>
          <div className="max-w-[35rem] min-w-0">
            <ArticleBody blocks={article.body} />
            <div className="mt-14 space-y-8 border-t border-line pt-8">
              <ShareLinks url={absoluteUrl(path)} title={article.title} />
              {author && <AuthorCard author={author} />}
            </div>
          </div>
        </div>
      </Container>

      {products.length > 0 && (
        <section aria-labelledby={ARTICLE_PAGE_IDS.products} className="border-t border-line bg-surface-alt py-12 sm:py-16">
          <Container>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="type-label mb-2">From the directory</p>
                <h2 id={ARTICLE_PAGE_IDS.products} className="type-h2 text-navy">
                  Products in this {section.nouns.one}
                </h2>
              </div>
              <p className="type-meta max-w-md sm:text-right">
                Profiles use sample data not yet verified with vendors. No reviews have been collected.
              </p>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <li key={p.slug}>
                  <ProductCompact product={p} vendorName={vendorNames.get(p.vendorSlug) ?? null} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {categories.length > 0 && (
        <section
          aria-labelledby={ARTICLE_PAGE_IDS.categories}
          className={products.length > 0 ? "pb-12 sm:pb-16 bg-surface-alt" : "border-t border-line py-12 sm:py-16"}
        >
          <Container>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
              <div>
                <p className="type-label mb-2">Browse</p>
                <h2 id={ARTICLE_PAGE_IDS.categories} className="type-h2 text-navy">
                  Related categories
                </h2>
              </div>
              <RelatedCategories items={categories} />
            </div>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby={ARTICLE_PAGE_IDS.related} className="border-t border-line py-12 sm:py-16">
          <Container>
            <p className="type-label mb-2">Keep reading</p>
            <h2 id={ARTICLE_PAGE_IDS.related} className="type-h2 text-navy">
              Related reading
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={`${item.kind}/${item.slug}`}>
                  <ArticleCard item={item} label="kind" />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd(article, author)) }} />
    </article>
  );
}
