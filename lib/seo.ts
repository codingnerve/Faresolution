/**
 * Page metadata helpers: absolute site URLs, canonical URLs and one builder
 * every page uses, so titles, canonicals, Open Graph and Twitter tags are
 * consistent across the site.
 *
 * Next.js merges metadata shallowly: a page that sets `openGraph` replaces the
 * root layout's object entirely (no inherited `siteName`, `locale` or `type`).
 * `buildMetadata` therefore always writes the complete Open Graph object.
 *
 * Title rule (R13): the root layout's template renders "<title> | Faresolution",
 * so a page title should be at most MAX_PAGE_TITLE_LENGTH (45) characters for
 * the rendered title to stay within 60. Data-driven titles are checked in
 * `seo-titles.test.ts` and `lib/data/integrity.test.ts`.
 */
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/utils";

export const TITLE_SUFFIX = ` | ${SITE_NAME}`;
/** Longest rendered <title> we aim for (search results truncate around here). */
export const MAX_TITLE_LENGTH = 60;
/** Longest page title before the template adds TITLE_SUFFIX. */
export const MAX_PAGE_TITLE_LENGTH = MAX_TITLE_LENGTH - TITLE_SUFFIX.length;
export const OG_LOCALE = "en_US";

/**
 * Absolute URL on the canonical origin. The path gets one leading slash,
 * repeated slashes collapse and trailing slashes are dropped (the root stays
 * "https://faresolution.com/"). A query string or fragment is kept as given.
 */
export function siteUrl(path = "/"): string {
  const trimmed = path.trim();
  const split = trimmed.search(/[?#]/);
  const pathname = split === -1 ? trimmed : trimmed.slice(0, split);
  const rest = split === -1 ? "" : trimmed.slice(split);
  const normalised = `/${pathname}`.replace(/\/{2,}/g, "/").replace(/(.)\/+$/, "$1");
  return `${SITE_URL}${normalised}${rest}`;
}

/**
 * Query parameters that make a different indexable page. None do on this
 * site: page, sort, view, search and every filter only re-order or narrow a
 * listing whose canonical is the bare path (the sitemap lists every product
 * directly, so nothing is reachable only through page 2+).
 */
const CANONICAL_QUERY_KEYS: readonly string[] = [];

/** Canonical absolute URL for a page: its path, without listing parameters. */
export function canonical(path: string, query?: Readonly<Record<string, string | undefined>>): string {
  const pathname = path.split(/[?#]/, 1)[0];
  const params = new URLSearchParams();
  for (const key of CANONICAL_QUERY_KEYS) {
    const value = query?.[key];
    if (value) params.set(key, value);
  }
  const search = params.toString();
  return siteUrl(search ? `${pathname}?${search}` : pathname);
}

/** The full title as the root template renders it ("About" -> "About | Faresolution"). */
export function brandedTitle(title: string): string {
  return `${title}${TITLE_SUFFIX}`;
}

export interface SeoImage {
  /** Absolute URL. */
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SeoArticle {
  /** ISO date. */
  publishedTime: string;
  modifiedTime?: string;
  section?: string;
  authors?: string[];
}

export interface SeoInput {
  /** Page title for the "%s | Faresolution" template, or `{ absolute }` for a title that already names the site (home). */
  title: string | { absolute: string };
  description: string;
  /** Site-relative path of the page; the canonical and og:url derive from it. */
  path: string;
  type?: "website" | "article";
  /** Open Graph / Twitter title; defaults to the full branded title. */
  ogTitle?: string;
  /** Keep the page out of search results (links are still followed unless `nofollow`). */
  noindex?: boolean;
  nofollow?: boolean;
  /** Only real, existing images; none are invented. */
  images?: SeoImage[];
  /** Article facts for `type: "article"`. */
  article?: SeoArticle;
}

/** Complete metadata for one page: title, description, canonical, Open Graph, Twitter and robots. */
export function buildMetadata(input: SeoInput): Metadata {
  const { title, description, path, type = "website", noindex = false, nofollow = false, images, article } = input;
  const url = canonical(path);
  const ogTitle = input.ogTitle ?? (typeof title === "string" ? brandedTitle(title) : title.absolute);
  const hasImages = images !== undefined && images.length > 0;
  const authors = article?.authors ?? [];

  const openGraph: NonNullable<Metadata["openGraph"]> =
    type === "article"
      ? {
          type: "article",
          siteName: SITE_NAME,
          locale: OG_LOCALE,
          url,
          title: ogTitle,
          description,
          ...(hasImages ? { images } : {}),
          ...(article
            ? {
                publishedTime: article.publishedTime,
                ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
                ...(article.section ? { section: article.section } : {}),
                ...(authors.length > 0 ? { authors } : {}),
              }
            : {}),
        }
      : {
          type: "website",
          siteName: SITE_NAME,
          locale: OG_LOCALE,
          url,
          title: ogTitle,
          description,
          ...(hasImages ? { images } : {}),
        };

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(authors.length > 0 ? { authors: authors.map((name) => ({ name })) } : {}),
    openGraph,
    twitter: {
      card: hasImages ? "summary_large_image" : "summary",
      title: ogTitle,
      description,
      ...(hasImages ? { images } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: !nofollow } } : {}),
  };
}
