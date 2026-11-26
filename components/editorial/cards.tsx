import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { ArticleCardData } from "@/lib/editorial";
import { cn } from "@/lib/utils";

export type { ArticleCardData };

/** Author, date and reading time as one quiet line. Missing parts are left out. */
export function ArticleMetaLine({ item, className }: { item: ArticleCardData; className?: string }) {
  const parts: { key: string; node: ReactNode }[] = [];
  if (item.authorName) parts.push({ key: "author", node: item.authorName });
  if (item.publishedLabel) {
    parts.push({ key: "date", node: <time dateTime={item.publishedAt}>{item.publishedLabel}</time> });
  }
  parts.push({ key: "time", node: `${item.readingMinutes} min read` });
  return (
    <p className={cn("type-meta flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {parts.map((part, index) => (
        <Fragment key={part.key}>
          {index > 0 && <span aria-hidden="true">&middot;</span>}
          <span>{part.node}</span>
        </Fragment>
      ))}
    </p>
  );
}

/**
 * Grid card: label, serif title, excerpt and meta. The whole card is the
 * link (stretched from the title), so there is one tab stop per card.
 */
export function ArticleCard({
  item,
  label = "category",
  headingLevel: Heading = "h3",
  className,
}: {
  item: ArticleCardData;
  /** Which label to show above the title. */
  label?: "category" | "kind";
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised",
        className,
      )}
    >
      {item.cover && (
        <div className="border-b border-line bg-surface-alt">
          <Image
            src={item.cover.src}
            alt={item.cover.alt}
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 94vw"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="type-label">{label === "kind" ? item.kindLabel : item.categoryLabel}</p>
        <Heading className="mt-3 font-serif text-[1.375rem] leading-[1.22] font-[460] tracking-[-0.012em] text-balance text-navy">
          <Link
            href={item.href}
            className="rounded-xs after:absolute after:inset-0 after:rounded-lg group-hover:text-blue-ink"
          >
            {item.title}
          </Link>
        </Heading>
        <p className="type-body mt-3 line-clamp-3 text-[0.9375rem] leading-6 text-subtle">{item.excerpt}</p>
        <ArticleMetaLine item={item} className="mt-auto pt-6" />
      </div>
    </article>
  );
}

/** Lead story for an index page: large serif headline with the meta and cover image set apart. */
export function FeaturedArticle({ item, headingLevel: Heading = "h2" }: { item: ArticleCardData; headingLevel?: "h2" | "h3" }) {
  return (
    <article className="group relative grid overflow-hidden rounded-lg border border-line bg-surface shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-blue-ink uppercase">
            <span aria-hidden="true" className="h-2 w-2 rounded-xs bg-blue" />
            {item.featured ? "Featured" : "Latest"}
          </span>
          <span className="type-label">{item.categoryLabel}</span>
        </p>
        <Heading className="mt-5 font-serif text-[1.875rem] leading-[1.12] font-[430] tracking-[-0.018em] text-balance text-navy sm:text-[2.5rem]">
          <Link
            href={item.href}
            className="rounded-xs after:absolute after:inset-0 after:rounded-lg group-hover:text-blue-ink"
          >
            {item.title}
          </Link>
        </Heading>
        <p className="mt-5 max-w-[60ch] font-serif text-[1.1875rem] leading-[1.55] text-pretty text-ink/85">
          {item.excerpt}
        </p>
      </div>
      <div className="flex flex-col justify-between border-t border-line bg-surface-alt lg:border-t-0 lg:border-l">
        {item.cover && (
          <div className="border-b border-line">
            <Image
              src={item.cover.src}
              alt={item.cover.alt}
              width={1600}
              height={900}
              priority
              sizes="(min-width: 1024px) 36vw, 94vw"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm lg:grid-cols-1">
            {item.authorName && (
              <div>
                <dt className="type-meta">Written by</dt>
                <dd className="mt-0.5 font-medium text-ink">{item.authorName}</dd>
              </div>
            )}
            {item.publishedLabel && (
              <div>
                <dt className="type-meta">Published</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  <time dateTime={item.publishedAt}>{item.publishedLabel}</time>
                </dd>
              </div>
            )}
            <div>
              <dt className="type-meta">Reading time</dt>
              <dd className="mt-0.5 font-medium text-ink">{item.readingMinutes} min</dd>
            </div>
          </dl>
          <span aria-hidden="true" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-ink">
            Read article
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2} />
          </span>
        </div>
      </div>
    </article>
  );
}
