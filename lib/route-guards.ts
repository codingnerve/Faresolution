/**
 * Existence checks for dynamic routes, used by `proxy.ts` to return a real 404.
 *
 * Under Cache Components a page's `notFound()` for a slug that was not
 * prerendered runs after the shell is sent, so the first response is 200 with
 * a noindex tag. Checking the slug here, before streaming starts, gives a true
 * 404. Pages still call `notFound()` as defence in depth.
 *
 * To add a dynamic route (R12): add a guard to `routeGuards` AND matching
 * entries to `config.matcher` in `proxy.ts` (a test fails unless the matcher
 * covers every path shape of every guard, sub-paths included), and cover the
 * guard in `route-guards.test.ts`.
 *
 * A guard may also name a canonical form of a known slug (comparisons list
 * their products in sorted order); `canonicalPath` gives the path the proxy
 * permanently redirects to. Like a 404, a redirect issued while the page
 * streams would arrive as a client-side meta refresh, not a real 308.
 *
 * Guards use the slug-only lists in `lib/data/content/slugs.ts`, not the
 * content arrays or the async data layer, to keep the proxy bundle small.
 * Lookups use `Set.has` with the decoded string, so keys such as `__proto__`
 * or `constructor` never resolve.
 */
import { resolveCompareSlug } from "@/lib/compare/slug";
import { categorySlugSet, industrySlugSet, productSlugSet } from "@/lib/data/content/slugs";
import { PRODUCT_TAB_SEGMENTS } from "@/lib/products/tabs";

export interface RouteGuard {
  /** Path before the dynamic part, with leading and trailing slash, e.g. "/categories/". */
  prefix: string;
  /** Number of path segments after the prefix (default 1). More are joined with "/" for `exists`. */
  segments?: number;
  /**
   * Static sub-paths allowed after the dynamic part, one segment each (e.g.
   * product tabs). The bare dynamic path is always allowed; any other trailing
   * segment is unknown.
   */
  subpaths?: readonly string[];
  exists: (slug: string) => boolean;
  /** For a slug that exists: its canonical form when different, else null. */
  canonical?: (slug: string) => string | null;
}

export const routeGuards: readonly RouteGuard[] = [
  { prefix: "/categories/", exists: (slug) => categorySlugSet.has(slug) },
  { prefix: "/industries/", exists: (slug) => industrySlugSet.has(slug) },
  { prefix: "/products/", subpaths: PRODUCT_TAB_SEGMENTS, exists: (slug) => productSlugSet.has(slug) },
  // Every product has an alternatives page; there are no sub-pages.
  { prefix: "/alternatives/", exists: (slug) => productSlugSet.has(slug) },
  // Every product has a review draft page; /reviews, /reviews/latest and /reviews/helpful are static.
  { prefix: "/reviews/write/", exists: (slug) => productSlugSet.has(slug) },
  {
    // 2 to 4 unique known products in any order; other orders redirect (R12).
    prefix: "/compare/",
    exists: (slug) => resolveCompareSlug(slug, productSlugSet).ok,
    canonical: (slug) => {
      const resolved = resolveCompareSlug(slug, productSlugSet);
      return resolved.ok && !resolved.isCanonical ? resolved.canonical : null;
    },
  },
];

type GuardMatch =
  | { kind: "unguarded" }
  | { kind: "unknown" }
  | { kind: "match"; guard: RouteGuard; slug: string; subpath: string | null };

function matchGuard(pathname: string): GuardMatch {
  for (const guard of routeGuards) {
    if (!pathname.startsWith(guard.prefix)) continue;
    // One trailing slash is normalised away by Next.js before rendering.
    const rest = pathname.slice(guard.prefix.length).replace(/\/$/, "");
    if (rest === "") return { kind: "unguarded" };
    const parts = rest.split("/");
    const segments = guard.segments ?? 1;
    if (parts.length !== segments && parts.length !== segments + 1) return { kind: "unknown" };
    const decoded: string[] = [];
    for (const part of parts) {
      try {
        decoded.push(decodeURIComponent(part));
      } catch {
        return { kind: "unknown" };
      }
    }
    // A decoded slash would make a different path than the one routed.
    if (decoded.some((part) => part === "" || part.includes("/"))) return { kind: "unknown" };
    const subpath = decoded.length > segments ? decoded[segments] : null;
    if (subpath !== null && !(guard.subpaths ?? []).includes(subpath)) return { kind: "unknown" };
    const slug = decoded.slice(0, segments).join("/");
    return guard.exists(slug) ? { kind: "match", guard, slug, subpath } : { kind: "unknown" };
  }
  return { kind: "unguarded" };
}

/**
 * `true`/`false` when a guard covers the path and the slug does/does not exist
 * (malformed escapes, encoded slashes and extra or missing segments are
 * unknown), `null` when no guard applies. Case sensitive.
 */
export function isKnownPath(pathname: string): boolean | null {
  const match = matchGuard(pathname);
  return match.kind === "unguarded" ? null : match.kind === "match";
}

/**
 * The canonical path for a known path whose guard defines a canonical form
 * that differs from the requested slug (sub-path kept, trailing slash
 * dropped); null otherwise.
 */
export function canonicalPath(pathname: string): string | null {
  const match = matchGuard(pathname);
  if (match.kind !== "match") return null;
  const canonical = match.guard.canonical?.(match.slug) ?? null;
  if (canonical === null) return null;
  return match.guard.prefix + canonical + (match.subpath === null ? "" : `/${match.subpath}`);
}

/**
 * One concrete path per shape a guard accepts: the bare dynamic path and each
 * sub-path, with "sample" standing in for every dynamic segment.
 */
export function guardSamplePaths(guard: RouteGuard): string[] {
  const base = guard.prefix + Array.from({ length: guard.segments ?? 1 }, () => "sample").join("/");
  return [base, ...(guard.subpaths ?? []).map((subpath) => `${base}/${subpath}`)];
}

/** Path-to-regexp meaning of a `:param` segment, by modifier. */
const PARAM_PATTERN = {
  "": "/[^/]+",
  "?": "(?:/[^/]+)?",
  "*": "(?:/[^/]+)*",
  "+": "(?:/[^/]+)+",
} as const;

/**
 * Regex for a proxy matcher path (the subset used here): literal segments and
 * `:param` segments with an optional `?`, `*` or `+` modifier, as in
 * path-to-regexp. Returns null for anything else.
 */
function matcherRegex(matcher: string): RegExp | null {
  if (!matcher.startsWith("/")) return null;
  let source = "";
  for (const segment of matcher.slice(1).split("/")) {
    const param = /^:[A-Za-z_]\w*([?*+]?)$/.exec(segment);
    if (param) {
      source += PARAM_PATTERN[param[1] as keyof typeof PARAM_PATTERN];
    } else if (/^[\w~-]+$/.test(segment)) {
      source += `/${segment}`;
    } else {
      return null;
    }
  }
  return new RegExp(`^${source}$`);
}

/** True when some matcher in the list matches `pathname` (see `matcherRegex`). */
export function matcherCovers(matchers: readonly string[], pathname: string): boolean {
  return matchers.some((matcher) => matcherRegex(matcher)?.test(pathname) ?? false);
}
