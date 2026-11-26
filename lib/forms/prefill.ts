/**
 * Query-string prefill for forms (for example `/contact?product=hubspot-crm`
 * from a product's "Request demo" button). Pages are static shells, so the
 * value is read on the client and must be validated here before use.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 100;

/**
 * The product slug to prefill, or null when the value is missing, repeated
 * (an array), malformed or not a known product. Lookups use `Set.has` on the
 * string itself, so keys such as `__proto__` never resolve.
 */
export function resolvePrefillProduct(param: unknown, slugs: ReadonlySet<string> | readonly string[]): string | null {
  if (typeof param !== "string") return null;
  const value = param.trim();
  if (value === "" || value.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(value)) return null;
  const known = slugs instanceof Set ? slugs : new Set(slugs as readonly string[]);
  return known.has(value) ? value : null;
}
