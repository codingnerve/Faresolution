import Link from "next/link";
import type { Article } from "@/lib/data";
import { ARTICLE_KIND_LABEL, articleHref, formatArticleDate } from "@/lib/editorial";

/** Related reading as a ruled list: kind and date, title, excerpt. The whole row is the link. */
export function RelatedArticles({ articles, labelledBy }: { articles: readonly Article[]; labelledBy: string }) {
  return (
    <ul aria-labelledby={labelledBy} className="divide-y divide-line border-y border-line">
      {articles.map((a) => (
        <li key={`${a.kind}/${a.slug}`}>
          <article className="group relative py-5 sm:py-6">
            <p className="type-meta flex flex-wrap items-center gap-x-2">
              <span className="font-semibold tracking-[0.06em] uppercase">{ARTICLE_KIND_LABEL[a.kind]}</span>
              {formatArticleDate(a.publishedAt) && (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <time dateTime={a.publishedAt}>{formatArticleDate(a.publishedAt)}</time>
                </>
              )}
            </p>
            <h3 className="mt-2 text-[1.0625rem] leading-6 font-semibold tracking-[-0.01em] text-navy">
              <Link
                href={articleHref(a.kind, a.slug)}
                className="rounded-xs after:absolute after:inset-0 group-hover:text-blue-ink"
              >
                {a.title}
              </Link>
            </h3>
            <p className="type-body mt-1.5 max-w-2xl text-subtle">{a.excerpt}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
