/**
 * Editorial helpers: article routes, reading time, table of contents, related
 * reading, index filtering and share links. Pure functions over the content
 * types, so they run on the server, in client components and in the proxy.
 */
import type { Article, ArticleKind, Block } from "@/lib/data/types";

export const ARTICLE_KINDS: readonly ArticleKind[] = ["blog", "guide", "best-software", "research", "buying-guide"];

/** Index route for each kind of editorial article; article pages sit one segment below. */
export const articleIndexHref: Readonly<Record<ArticleKind, string>> = {
  blog: "/blog",
  guide: "/guides",
  "best-software": "/best-software",
  research: "/research",
  "buying-guide": "/software-buying-guides",
};

export const articleHref = (kind: ArticleKind, slug: string): string => `${articleIndexHref[kind]}/${slug}`;

/** Singular label for one article of a kind ("Guide"), used on cards and in metadata. */
export const ARTICLE_KIND_LABEL: Readonly<Record<ArticleKind, string>> = {
  blog: "Blog",
  guide: "Guide",
  "best-software": "Best software",
  research: "Research",
  "buying-guide": "Buying guide",
};

export interface ArticleSection {
  /** Index page H1 and breadcrumb label. */
  title: string;
  /** What the section is, shown under the H1 and used for metadata. */
  description: string;
  /** Short line for the resources hub and navigation. */
  summary: string;
  /** Nouns for counts ("2 posts"). */
  nouns: { one: string; other: string };
}

/** What each editorial section is, stated plainly. */
export const ARTICLE_SECTIONS: Readonly<Record<ArticleKind, ArticleSection>> = {
  blog: {
    title: "Blog",
    description:
      "Short pieces from the Faresolution editors on choosing, paying for and living with business software. They are practical opinion and advice, not product reviews.",
    summary: "Notes on choosing and rolling out software",
    nouns: { one: "post", other: "posts" },
  },
  guide: {
    title: "Guides",
    description:
      "Step-by-step help with the work around a software decision: running a trial, migrating data, answering a security questionnaire and automating a process safely.",
    summary: "Step-by-step help for common decisions",
    nouns: { one: "guide", other: "guides" },
  },
  "best-software": {
    title: "Best software",
    description:
      "Editor shortlists of products worth putting in a first round of trials. Each list states its criteria. They are not rankings, are not based on user reviews and do not come from hands-on testing.",
    summary: "Editor shortlists by category",
    nouns: { one: "shortlist", other: "shortlists" },
  },
  research: {
    title: "Research",
    description:
      "Methods and frameworks for evaluating software, and how Faresolution records product facts. These pieces explain approaches; they do not report survey results or proprietary data.",
    summary: "Evaluation frameworks and our methodology",
    nouns: { one: "piece", other: "pieces" },
  },
  "buying-guide": {
    title: "Software buying guides",
    description:
      "What to settle before you buy a type of software: the requirements to write down, the questions to ask vendors, the pricing details to check and how to plan the rollout.",
    summary: "What to check before you sign",
    nouns: { one: "buying guide", other: "buying guides" },
  },
};

// ---------------------------------------------------------------------------
// Reading time

const WORDS_PER_MINUTE = 200;

const wordsIn = (text: string | undefined) => (text ? text.split(/\s+/).filter(Boolean).length : 0);

/** Words across every text-bearing block: headings, paragraphs, list items and callouts (title included). */
export function countWords(blocks: readonly Block[]): number {
  let total = 0;
  for (const block of blocks) {
    if (block.type === "ul") total += block.items.reduce((sum, item) => sum + wordsIn(item), 0);
    else if (block.type === "callout") total += wordsIn(block.title) + wordsIn(block.text);
    else total += wordsIn(block.text);
  }
  return total;
}

/** Whole minutes to read at 200 words per minute, rounded up, never below 1. */
export function readingTime(blocks: readonly Block[]): number {
  return Math.max(1, Math.ceil(countWords(blocks) / WORDS_PER_MINUTE));
}

// ---------------------------------------------------------------------------
// Table of contents

/** URL-fragment-safe id from heading text ("What's next?" -> "what-s-next"); "section" when empty. */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

/**
 * The id of each block when rendered: a unique slug for h2/h3 blocks (a
 * repeated heading gets "-2", "-3", ...), null for every other block.
 * `buildToc` uses the same ids, so the contents always link to the headings.
 */
export function headingIds(blocks: readonly Block[]): (string | null)[] {
  const used = new Set<string>();
  return blocks.map((block) => {
    if (block.type !== "h2" && block.type !== "h3") return null;
    const base = slugify(block.text);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  });
}

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

/** The article's h2 and h3 headings in order, with the ids they are rendered with. */
export function buildToc(blocks: readonly Block[]): TocEntry[] {
  const ids = headingIds(blocks);
  const toc: TocEntry[] = [];
  blocks.forEach((block, index) => {
    const id = ids[index];
    if (id !== null && (block.type === "h2" || block.type === "h3")) {
      toc.push({ id, text: block.text, level: block.type === "h2" ? 2 : 3 });
    }
  });
  return toc;
}

// ---------------------------------------------------------------------------
// Ordering and related reading

const articleKey = (a: Pick<Article, "kind" | "slug">) => `${a.kind}/${a.slug}`;

/** Newest `publishedAt` first, then title, then kind/slug: a total, stable order. */
function compareNewest(a: Article, b: Article): number {
  return (
    b.publishedAt.localeCompare(a.publishedAt) ||
    a.title.localeCompare(b.title, "en") ||
    articleKey(a).localeCompare(articleKey(b))
  );
}

/** A new array, newest first. Does not mutate. */
export function sortByNewest(articles: readonly Article[]): Article[] {
  return [...articles].sort(compareNewest);
}

/**
 * The lead story for an index (the newest featured article, else the newest
 * article) and every other article, newest first.
 */
export function pickLead(articles: readonly Article[]): { lead: Article | null; rest: Article[] } {
  const sorted = sortByNewest(articles);
  const lead = sorted.find((a) => a.featured) ?? sorted[0] ?? null;
  return { lead, rest: lead ? sorted.filter((a) => a !== lead) : [] };
}

/**
 * Up to `limit` other articles to read next: most shared related categories
 * and products first, then articles of the same kind, then the newest.
 * Excludes the article itself (same kind and slug). Deterministic; does not mutate.
 */
export function relatedArticles(article: Article, all: readonly Article[], limit = 3): Article[] {
  const categories = new Set(article.relatedCategorySlugs);
  const products = new Set(article.relatedProductSlugs);
  const self = articleKey(article);
  return all
    .filter((a) => articleKey(a) !== self)
    .map((a) => ({
      article: a,
      shared:
        a.relatedCategorySlugs.filter((s) => categories.has(s)).length +
        a.relatedProductSlugs.filter((s) => products.has(s)).length,
      sameKind: a.kind === article.kind ? 1 : 0,
    }))
    .sort((x, y) => y.shared - x.shared || y.sameKind - x.sameKind || compareNewest(x.article, y.article))
    .slice(0, Math.max(0, limit))
    .map((x) => x.article);
}

// ---------------------------------------------------------------------------
// Cards

/** Serialisable summary of an article for cards and the client-side index. */
export interface ArticleCardData {
  kind: ArticleKind;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  categoryLabel: string;
  /** Singular kind label, e.g. "Buying guide". */
  kindLabel: string;
  publishedAt: string;
  /** Formatted `publishedAt`, or null when the date does not parse. */
  publishedLabel: string | null;
  authorName: string | null;
  readingMinutes: number;
  featured: boolean;
}

export function toArticleCard(article: Article, authorName: string | null): ArticleCardData {
  return {
    kind: article.kind,
    slug: article.slug,
    href: articleHref(article.kind, article.slug),
    title: article.title,
    excerpt: article.excerpt,
    categoryLabel: article.categoryLabel,
    kindLabel: ARTICLE_KIND_LABEL[article.kind],
    publishedAt: article.publishedAt,
    publishedLabel: formatArticleDate(article.publishedAt),
    authorName,
    readingMinutes: readingTime(article.body),
    featured: article.featured,
  };
}

/** Distinct category labels in first-seen order (the chips on an index page). */
export function categoryLabels(items: readonly { categoryLabel: string }[]): string[] {
  return [...new Set(items.map((item) => item.categoryLabel))];
}

// ---------------------------------------------------------------------------
// Index filtering

const normalise = (text: string) => text.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Items whose title contains every word of the query (case-insensitive, plain
 * text, so regex characters match literally) and, when a label is given,
 * whose category label equals it. An empty query matches everything.
 */
export function filterArticles<T extends { title: string; categoryLabel: string }>(
  items: readonly T[],
  { query, label }: { query: string; label: string | null },
): T[] {
  const terms = normalise(query).split(" ").filter(Boolean);
  return items.filter((item) => {
    if (label !== null && item.categoryLabel !== label) return false;
    const title = normalise(item.title);
    return terms.every((term) => title.includes(term));
  });
}

// ---------------------------------------------------------------------------
// Sharing and dates

/** Share URLs for an absolute canonical URL; every value is URI-encoded. */
export function shareLinks(url: string, title: string): { x: string; linkedin: string } {
  const u = encodeURIComponent(url);
  return {
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}

// Dates in content are calendar dates; format in UTC so they never shift a day.
const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Mar 24, 2026" for an ISO calendar date, or null when it does not parse. */
export function formatArticleDate(iso: string): string | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}
