/**
 * Demo form submissions. Nothing is sent anywhere: entries are kept in this
 * browser's localStorage, or in memory when storage is missing, blocked,
 * full or holding corrupt data. `saveSubmission` never throws.
 */
import { readJson, writeJson } from "@/lib/storage";

export type SubmissionKind = "newsletter" | "contact" | "review-draft" | "claim";

export interface Submission {
  id: string;
  kind: SubmissionKind;
  payload: Record<string, unknown>;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export type SaveResult = { ok: true; id: string };

/** Honest confirmation shown after every demo form submission. */
export const SUBMISSION_NOTICE =
  "This demo isn't connected to email yet; your entry is stored only in this browser.";

export const SUBMISSIONS_STORAGE_KEY = "faresolution:submissions";

/** Oldest entries are dropped beyond this many, to stay well under quota. */
const MAX_ENTRIES = 100;

// --- Submissions --------------------------------------------------------------

/** This page session's entries, kept even when they could not be persisted. */
const memory: Submission[] = [];

function isSubmission(value: unknown): value is Submission {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.kind === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.payload === "object" &&
    v.payload !== null
  );
}

function readPersisted(): Submission[] {
  const value = readJson(SUBMISSIONS_STORAGE_KEY);
  return Array.isArray(value) ? value.filter(isSubmission) : [];
}

function createId(): string {
  try {
    const id = globalThis.crypto?.randomUUID?.();
    if (id) return id;
  } catch {
    // randomUUID is unavailable outside secure contexts; fall through.
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function copyPayload(payload: Record<string, unknown>): Record<string, unknown> {
  try {
    return structuredClone(payload);
  } catch {
    return { ...payload };
  }
}

export function saveSubmission(
  kind: SubmissionKind,
  payload: Record<string, unknown>,
): SaveResult {
  const entry: Submission = {
    id: createId(),
    kind,
    payload: copyPayload(payload),
    createdAt: new Date().toISOString(),
  };
  // Always mirrored in memory, so this page session still sees the entry even
  // if storage later becomes unreadable.
  memory.push(entry);
  if (memory.length > MAX_ENTRIES) memory.splice(0, memory.length - MAX_ENTRIES);
  writeJson(SUBMISSIONS_STORAGE_KEY, [...readPersisted(), entry].slice(-MAX_ENTRIES));
  return { ok: true, id: entry.id };
}

/** Stored entries (persisted first, then in-memory), optionally of one kind. */
export function listSubmissions(kind?: SubmissionKind): Submission[] {
  const persisted = readPersisted();
  const seen = new Set(persisted.map((s) => s.id));
  const all = [...persisted, ...memory.filter((s) => !seen.has(s.id))];
  return kind ? all.filter((s) => s.kind === kind) : all;
}
