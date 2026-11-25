/**
 * Pure rules for the visitor's compare selection (the tray): at most
 * MAX_COMPARE unique products that exist in the catalogue. Kept apart from the
 * hook so the rules are testable without React or storage.
 */
import { MAX_COMPARE } from "./slug";

export type AddResult = { added: true; list: string[] } | { added: false; reason: "full" | "duplicate" | "unknown"; list: string[] };

/** A stored list made safe: known slugs only, first occurrence kept, at most MAX_COMPARE. */
export function normalizeSelection(list: readonly string[], known: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const slug of list) {
    if (out.length >= MAX_COMPARE) break;
    if (known.has(slug) && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export function addToSelection(list: readonly string[], slug: string, known: ReadonlySet<string>): AddResult {
  const current = [...list];
  if (current.includes(slug)) return { added: false, reason: "duplicate", list: current };
  if (!known.has(slug)) return { added: false, reason: "unknown", list: current };
  if (current.length >= MAX_COMPARE) return { added: false, reason: "full", list: current };
  return { added: true, list: [...current, slug] };
}

export function removeFromSelection(list: readonly string[], slug: string): string[] {
  return list.filter((entry) => entry !== slug);
}
