/**
 * Browser storage that never throws.
 *
 * localStorage can be missing (server, some embedded browsers), blocked
 * (private modes, disabled site data: even reading the property throws), full,
 * or hold corrupt data written by an older build. Every helper here swallows
 * those failures. List values fall back to an in-memory copy for the rest of
 * the page session, so features such as saved products keep working; they just
 * do not survive a reload.
 *
 * `useStoredList` exposes a list to React components and re-renders them when
 * it changes in this tab or another one.
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";

function getStorage(): Storage | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage && typeof storage.getItem === "function" ? storage : null;
  } catch {
    return null;
  }
}

function readRaw(key: string): string | null {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Parsed JSON stored under `key`, or `null` when missing, unreadable or invalid. */
export function readJson(key: string): unknown {
  const raw = readRaw(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** True when the value was written; false on any failure (never throws). */
export function writeJson(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// --- String lists ---------------------------------------------------------------

/** Lists that could not be persisted; they win over storage until a write succeeds. */
const memory = new Map<string, readonly string[]>();

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * The list stored under `key`: `[]` when nothing valid is stored (missing,
 * unreadable, invalid JSON, or not an array of strings). Returns a fresh copy.
 */
export function readList(key: string): string[] {
  const remembered = memory.get(key);
  if (remembered) return [...remembered];
  const value = readJson(key);
  return isStringArray(value) ? [...value] : [];
}

/**
 * Stores `list` under `key` and notifies subscribers. Never throws: when
 * storage fails the list is kept in memory and `readList` returns it.
 * Returns true when the list reached storage, false when it is in memory only.
 */
export function writeList(key: string, list: readonly string[]): boolean {
  const copy = Object.freeze([...list]);
  const persisted = writeJson(key, copy);
  if (persisted) memory.delete(key);
  else memory.set(key, copy);
  notify(key);
  return persisted;
}

/**
 * False when the last write to `key` could not reach storage, so the list is
 * kept in memory for this page session only (lost on reload).
 */
export function isListPersisted(key: string): boolean {
  return !memory.has(key);
}

export function addToList(key: string, item: string): void {
  const list = readList(key);
  if (!list.includes(item)) writeList(key, [...list, item]);
}

export function removeFromList(key: string, item: string): void {
  const list = readList(key);
  if (list.includes(item)) writeList(key, list.filter((entry) => entry !== item));
}

/** Adds `item` when absent, removes it when present. Returns whether it is now in the list. */
export function toggleInList(key: string, item: string): boolean {
  const list = readList(key);
  const present = list.includes(item);
  writeList(key, present ? list.filter((entry) => entry !== item) : [...list, item]);
  return !present;
}

// --- External store for useSyncExternalStore -------------------------------------

const listeners = new Map<string, Set<() => void>>();
const snapshots = new Map<string, { source: string; list: readonly string[] }>();
const EMPTY: readonly string[] = Object.freeze([]);

function notify(key: string | null): void {
  if (key === null) {
    for (const set of listeners.values()) set.forEach((listener) => listener());
    return;
  }
  listeners.get(key)?.forEach((listener) => listener());
}

/** Changes made in other tabs arrive as `storage` events (`key: null` = cleared). */
function onStorage(event: Event): void {
  const key = (event as StorageEvent).key;
  notify(typeof key === "string" ? key : null);
}

function storageEventTarget(): EventTarget | null {
  try {
    const target = (globalThis as { window?: EventTarget }).window;
    return target && typeof target.addEventListener === "function" ? target : null;
  } catch {
    return null;
  }
}

let listening = false;

function updateStorageListener(): void {
  const wanted = listeners.size > 0;
  if (wanted === listening) return;
  const target = storageEventTarget();
  if (!target) return;
  if (wanted) target.addEventListener("storage", onStorage);
  else target.removeEventListener("storage", onStorage);
  listening = wanted;
}

/** Calls `listener` whenever the list under `key` changes, here or in another tab. */
export function subscribeList(key: string, listener: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  updateStorageListener();
  return () => {
    const current = listeners.get(key);
    current?.delete(listener);
    if (current && current.size === 0) listeners.delete(key);
    updateStorageListener();
  };
}

/**
 * The current list as a frozen array that stays the same object until the
 * stored value changes, as `useSyncExternalStore` requires.
 */
export function getListSnapshot(key: string): readonly string[] {
  const remembered = memory.get(key);
  const source = remembered ? `memory:${JSON.stringify(remembered)}` : `storage:${readRaw(key) ?? ""}`;
  const cached = snapshots.get(key);
  if (cached && cached.source === source) return cached.list;
  const list = Object.freeze(readList(key));
  snapshots.set(key, { source, list });
  return list;
}

/** Nothing is stored on the server, so it and the first client render agree. */
export function getServerListSnapshot(): readonly string[] {
  return EMPTY;
}

export interface StoredListActions {
  add: (item: string) => void;
  remove: (item: string) => void;
  /** Returns whether the item is in the list afterwards. */
  toggle: (item: string) => boolean;
  has: (item: string) => boolean;
}

/**
 * A string list kept in localStorage (or memory when storage fails). Renders
 * `[]` on the server and during hydration, then the stored value.
 */
export function useStoredList(key: string): [readonly string[], StoredListActions] {
  const subscribe = useCallback((listener: () => void) => subscribeList(key, listener), [key]);
  const list = useSyncExternalStore(subscribe, () => getListSnapshot(key), getServerListSnapshot);
  const actions = useMemo<StoredListActions>(
    () => ({
      add: (item) => addToList(key, item),
      remove: (item) => removeFromList(key, item),
      toggle: (item) => toggleInList(key, item),
      has: (item) => list.includes(item),
    }),
    [key, list],
  );
  return [list, actions];
}
