/**
 * Compare URLs: `/compare/<a>-vs-<b>[-vs-<c>[-vs-<d>]]`.
 *
 * Splitting on "-vs-" is unambiguous because no product slug contains "-vs-"
 * (lib/data/integrity.test.ts enforces it), so no lookup of known slugs is
 * needed to parse. The canonical form lists the products sorted by slug, so
 * each set of products has exactly one URL; other orders redirect to it.
 * Everything here is pure and client-safe (used by proxy.ts, pages and the
 * compare tray).
 */

export const COMPARE_SEPARATOR = "-vs-";
export const MIN_COMPARE = 2;
export const MAX_COMPARE = 4;

export type CompareInvalidReason = "count" | "unknown" | "duplicate";

export type CompareValidation = { ok: true; slugs: string[] } | { ok: false; reason: CompareInvalidReason };

export type CompareResolution =
  | { ok: true; slugs: string[]; canonical: string; isCanonical: boolean }
  | { ok: false; reason: CompareInvalidReason };

/** Product slugs in a compare slug, in URL order. Empty parts are kept (they fail validation). */
export function parseCompareSlug(slug: string): string[] {
  return slug.split(COMPARE_SEPARATOR);
}

/** Canonical compare slug: unique slugs sorted by code unit, joined with "-vs-". */
export function buildCompareSlug(slugs: readonly string[]): string {
  return [...new Set(slugs)].sort().join(COMPARE_SEPARATOR);
}

/**
 * Checks, in this order: 2 to 4 entries (`count`), no repeats (`duplicate`),
 * every slug known (`unknown`; exact, case-sensitive `Set.has`, so keys such
 * as `__proto__` never match). On success returns the slugs in input order.
 */
export function validateCompareSlugs(slugs: readonly string[], known: ReadonlySet<string>): CompareValidation {
  if (slugs.length < MIN_COMPARE || slugs.length > MAX_COMPARE) return { ok: false, reason: "count" };
  if (new Set(slugs).size !== slugs.length) return { ok: false, reason: "duplicate" };
  if (!slugs.every((slug) => known.has(slug))) return { ok: false, reason: "unknown" };
  return { ok: true, slugs: [...slugs] };
}

/** Parses and validates a compare slug; on success also gives the canonical slug and order. */
export function resolveCompareSlug(slug: string, known: ReadonlySet<string>): CompareResolution {
  const result = validateCompareSlugs(parseCompareSlug(slug), known);
  if (!result.ok) return result;
  const canonical = buildCompareSlug(result.slugs);
  return { ok: true, slugs: parseCompareSlug(canonical), canonical, isCanonical: canonical === slug };
}

/** URL of the comparison of `slugs` (canonical order). */
export function compareHref(slugs: readonly string[]): string {
  return `/compare/${buildCompareSlug(slugs)}`;
}

/** The comparison without `slug`, or the compare picker when fewer than two would remain. */
export function compareHrefWithout(slugs: readonly string[], slug: string): string {
  const rest = slugs.filter((s) => s !== slug);
  return rest.length >= MIN_COMPARE ? compareHref(rest) : "/compare";
}

/** The comparison with `slug` added, or null when it is already in it or the comparison is full. */
export function compareHrefWith(slugs: readonly string[], slug: string): string | null {
  if (slugs.includes(slug) || slugs.length >= MAX_COMPARE) return null;
  return compareHref([...slugs, slug]);
}
