/**
 * The visitor's compare selection, kept in localStorage via `lib/storage`
 * (in memory when storage is blocked, so the tray still works for the page
 * session). Up to MAX_COMPARE products; unknown or surplus stored entries are
 * ignored. Renders `[]` on the server and during hydration, then the stored
 * list, so server and first client render always match.
 *
 * Also holds a small "notice" (e.g. why a fifth product was refused) that the
 * compare tray and picker show and announce.
 */
import { useMemo, useSyncExternalStore } from "react";
import { productSlugSet } from "@/lib/data/content/slugs";
import { readList, useStoredList, writeList } from "@/lib/storage";
import { addToSelection, normalizeSelection, removeFromSelection } from "./selection";
import { MAX_COMPARE } from "./slug";

/** localStorage key for the compare selection. */
export const COMPARE_KEY = "faresolution:compare";

export const COMPARE_FULL_MESSAGE = `You can compare up to ${MAX_COMPARE} products. Remove one to add another.`;

/** The current selection, cleaned. */
export function readCompare(): string[] {
  return normalizeSelection(readList(COMPARE_KEY), productSlugSet);
}

/**
 * Adds a product. Returns false (and leaves the list alone) when it is already
 * selected, unknown, or the selection is full; a full selection also sets the
 * notice explaining why.
 */
export function addToCompare(slug: string): boolean {
  const result = addToSelection(readCompare(), slug, productSlugSet);
  if (result.added) {
    writeList(COMPARE_KEY, result.list);
  } else if (result.reason === "full") {
    showCompareNotice(COMPARE_FULL_MESSAGE);
  }
  return result.added;
}

export function removeFromCompare(slug: string): void {
  writeList(COMPARE_KEY, removeFromSelection(readCompare(), slug));
}

export function clearCompare(): void {
  writeList(COMPARE_KEY, []);
}

export interface UseCompare {
  slugs: string[];
  /** False when full, already selected or unknown. */
  add: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  isFull: boolean;
}

export function useCompare(): UseCompare {
  const [stored] = useStoredList(COMPARE_KEY);
  const slugs = useMemo(() => normalizeSelection(stored, productSlugSet), [stored]);
  return {
    slugs,
    add: addToCompare,
    remove: removeFromCompare,
    clear: clearCompare,
    isFull: slugs.length >= MAX_COMPARE,
  };
}

// --- Notice -------------------------------------------------------------------

export interface CompareNotice {
  /** Increments on every notice, so the same text shown twice still re-renders. */
  id: number;
  text: string;
}

let notice: CompareNotice = { id: 0, text: "" };
const noticeListeners = new Set<() => void>();
const NO_NOTICE: CompareNotice = { id: 0, text: "" };

export function getCompareNotice(): CompareNotice {
  return notice;
}

export function showCompareNotice(text: string): void {
  notice = { id: notice.id + 1, text };
  noticeListeners.forEach((listener) => listener());
}

export function dismissCompareNotice(): void {
  if (notice.text === "") return;
  notice = { id: notice.id + 1, text: "" };
  noticeListeners.forEach((listener) => listener());
}

function subscribeNotice(listener: () => void): () => void {
  noticeListeners.add(listener);
  return () => {
    noticeListeners.delete(listener);
  };
}

/** The latest compare notice (empty text when there is none). */
export function useCompareNotice(): CompareNotice {
  return useSyncExternalStore(subscribeNotice, getCompareNotice, () => NO_NOTICE);
}
