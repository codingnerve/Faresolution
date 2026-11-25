/**
 * Existence checks for dynamic routes, used by `proxy.ts` to return a real 404.
 *
 * Under Cache Components a page's `notFound()` for a slug that was not
 * prerendered runs after the shell is sent, so the first response is 200 with
 * a noindex tag. Checking the slug here, before streaming starts, gives a true
 * 404. Pages still call `notFound()` as defence in depth.
 *
 * To add a dynamic route (R12): add a guard to `routeGuards` AND a matching
 * `:param` entry to `config.matcher` in `proxy.ts` (a test fails if the matcher
 * is missing), and cover the guard in `route-guards.test.ts`.
 *
 * Guards use slug sets built from the content arrays, not the async data
 * layer, to keep the proxy bundle small. Lookups use `Set.has` with the
 * decoded string, so keys such as `__proto__` or `constructor` never resolve.
 */
import { categories } from "@/lib/data/content/categories";

export interface RouteGuard {
  /** Path before the dynamic part, with leading and trailing slash, e.g. "/categories/". */
  prefix: string;
  /** Number of path segments after the prefix (default 1). More are joined with "/" for `exists`. */
  segments?: number;
  exists: (slug: string) => boolean;
}

const categorySlugs: ReadonlySet<string> = new Set(categories.map((c) => c.slug));

export const routeGuards: readonly RouteGuard[] = [
  { prefix: "/categories/", exists: (slug) => categorySlugs.has(slug) },
];

/**
 * `true`/`false` when a guard covers the path and the slug does/does not exist
 * (malformed escapes, encoded slashes and extra or missing segments are
 * unknown), `null` when no guard applies. Case sensitive.
 */
export function isKnownPath(pathname: string): boolean | null {
  for (const guard of routeGuards) {
    if (!pathname.startsWith(guard.prefix)) continue;
    // One trailing slash is normalised away by Next.js before rendering.
    const rest = pathname.slice(guard.prefix.length).replace(/\/$/, "");
    if (rest === "") return null;
    const parts = rest.split("/");
    if (parts.length !== (guard.segments ?? 1)) return false;
    const decoded: string[] = [];
    for (const part of parts) {
      try {
        decoded.push(decodeURIComponent(part));
      } catch {
        return false;
      }
    }
    // A decoded slash would make a different path than the one routed.
    if (decoded.some((part) => part === "" || part.includes("/"))) return false;
    return guard.exists(decoded.join("/"));
  }
  return null;
}

/** True when some matcher is `<prefix>:param` (optionally with a modifier), e.g. "/categories/:slug". */
export function matcherCoversPrefix(matchers: readonly string[], prefix: string): boolean {
  return matchers.some((m) => m.startsWith(prefix) && m.slice(prefix.length).startsWith(":"));
}
