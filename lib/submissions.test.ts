import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type SubmissionsModule = typeof import("./submissions");

/** Minimal in-memory Storage stand-in (node has no localStorage). */
function createStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => (data.has(key) ? data.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, String(value));
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key);
    }),
    clear: vi.fn(() => data.clear()),
    key: vi.fn((i: number) => [...data.keys()][i] ?? null),
    get length() {
      return data.size;
    },
    raw: data,
  };
}

// Fresh module per test so the in-memory fallback never leaks between tests.
async function load(): Promise<SubmissionsModule> {
  vi.resetModules();
  return import("./submissions");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("saveSubmission", () => {
  it("returns ok with a non-empty id and persists to localStorage", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, SUBMISSIONS_STORAGE_KEY } = await load();

    const result = saveSubmission("newsletter", { email: "person@example.com" });

    expect(result.ok).toBe(true);
    expect(typeof result.id).toBe("string");
    expect(result.id.length).toBeGreaterThan(0);

    const stored = JSON.parse(storage.raw.get(SUBMISSIONS_STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      id: result.id,
      kind: "newsletter",
      payload: { email: "person@example.com" },
    });
    expect(Number.isNaN(Date.parse(stored[0].createdAt))).toBe(false);
  });

  it("appends to existing entries and gives each a unique id", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions } = await load();

    const a = saveSubmission("newsletter", { email: "a@example.com" });
    const b = saveSubmission("contact", { message: "Hello" });

    expect(a.id).not.toBe(b.id);
    expect(listSubmissions().map((s) => s.id)).toEqual([a.id, b.id]);
    expect(listSubmissions("contact").map((s) => s.id)).toEqual([b.id]);
  });

  it("survives a throwing setItem and keeps the entry in memory", async () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions } = await load();

    let result: ReturnType<SubmissionsModule["saveSubmission"]> | undefined;
    expect(() => {
      result = saveSubmission("newsletter", { email: "person@example.com" });
    }).not.toThrow();
    expect(result?.ok).toBe(true);
    expect(listSubmissions("newsletter").map((s) => s.id)).toEqual([result!.id]);
  });

  it("survives a throwing getItem", async () => {
    const storage = createStorage();
    storage.getItem.mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions } = await load();

    const result = saveSubmission("claim", { product: "hubspot-crm" });
    expect(result.ok).toBe(true);
    expect(() => listSubmissions()).not.toThrow();
  });

  it("survives localStorage access itself throwing (blocked storage)", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Access denied", "SecurityError");
      },
    });
    try {
      const { saveSubmission, listSubmissions } = await load();
      const result = saveSubmission("newsletter", { email: "person@example.com" });
      expect(result.ok).toBe(true);
      expect(listSubmissions().map((s) => s.id)).toEqual([result.id]);
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });

  it("works in memory when localStorage is missing", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { saveSubmission, listSubmissions } = await load();

    const a = saveSubmission("newsletter", { email: "a@example.com" });
    const b = saveSubmission("newsletter", { email: "b@example.com" });
    expect(a.ok && b.ok).toBe(true);
    expect(listSubmissions().map((s) => s.id)).toEqual([a.id, b.id]);
  });

  it("recovers from corrupt JSON without throwing", async () => {
    const storage = createStorage({ "faresolution:submissions": "{not json" });
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions, SUBMISSIONS_STORAGE_KEY } = await load();

    expect(() => listSubmissions()).not.toThrow();
    expect(listSubmissions()).toEqual([]);

    const result = saveSubmission("newsletter", { email: "person@example.com" });
    expect(result.ok).toBe(true);
    const stored = JSON.parse(storage.raw.get(SUBMISSIONS_STORAGE_KEY)!);
    expect(stored.map((s: { id: string }) => s.id)).toEqual([result.id]);
  });

  it("ignores stored JSON of the wrong shape and malformed entries", async () => {
    const storage = createStorage({
      "faresolution:submissions": JSON.stringify([
        { id: "keep", kind: "newsletter", payload: { email: "x@example.com" }, createdAt: "2026-11-25T00:00:00.000Z" },
        null,
        "string",
        { id: 5, kind: "newsletter" },
        { id: "no-kind" },
      ]),
    });
    vi.stubGlobal("localStorage", storage);
    const { listSubmissions } = await load();
    expect(listSubmissions().map((s) => s.id)).toEqual(["keep"]);

    storage.raw.set("faresolution:submissions", JSON.stringify({ not: "an array" }));
    expect(listSubmissions()).toEqual([]);
  });

  it("does not throw on a payload that cannot be serialised", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions } = await load();

    const circular: Record<string, unknown> = { email: "person@example.com" };
    circular.self = circular;
    let result: ReturnType<SubmissionsModule["saveSubmission"]> | undefined;
    expect(() => {
      result = saveSubmission("newsletter", circular);
    }).not.toThrow();
    expect(result?.ok).toBe(true);
    expect(listSubmissions().map((s) => s.id)).toEqual([result!.id]);
  });

  it("stores a copy, so later mutation of the payload does not change the entry", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { saveSubmission, listSubmissions } = await load();

    const payload = { email: "person@example.com" };
    saveSubmission("newsletter", payload);
    payload.email = "changed@example.com";
    expect(listSubmissions()[0].payload).toEqual({ email: "person@example.com" });
  });
});

describe("removeSubmission", () => {
  it("removes one entry from storage and memory, keeping the others", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, removeSubmission, listSubmissions, SUBMISSIONS_STORAGE_KEY } = await load();

    const a = saveSubmission("review-draft", { product: "hubspot-crm" });
    const b = saveSubmission("newsletter", { email: "a@example.com" });

    expect(removeSubmission(a.id)).toBe(true);
    expect(listSubmissions().map((s) => s.id)).toEqual([b.id]);
    expect(JSON.parse(storage.raw.get(SUBMISSIONS_STORAGE_KEY)!).map((s: { id: string }) => s.id)).toEqual([b.id]);
  });

  it("is a harmless no-op for an unknown id", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const { saveSubmission, removeSubmission, listSubmissions } = await load();

    const a = saveSubmission("claim", { product: "x" });
    expect(removeSubmission("does-not-exist")).toBe(true);
    expect(listSubmissions().map((s) => s.id)).toEqual([a.id]);
  });

  it("works in memory when storage is missing", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { saveSubmission, removeSubmission, listSubmissions } = await load();

    const a = saveSubmission("review-draft", { product: "hubspot-crm" });
    expect(removeSubmission(a.id)).toBe(true);
    expect(listSubmissions()).toEqual([]);
  });

  it("reports false instead of throwing when the entry cannot be removed from storage", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, removeSubmission, listSubmissions } = await load();

    const a = saveSubmission("review-draft", { product: "hubspot-crm" });
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    let removed: boolean | undefined;
    expect(() => {
      removed = removeSubmission(a.id);
    }).not.toThrow();
    expect(removed).toBe(false);
    expect(listSubmissions().map((s) => s.id)).toEqual([a.id]);
  });
});

describe("saveSubmission: persisted flag and replacement", () => {
  it("reports persisted: true when the entry was written to storage", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const { saveSubmission } = await load();
    expect(saveSubmission("newsletter", { email: "a@example.com" })).toMatchObject({ ok: true, persisted: true });
  });

  it("stores the Task 14 form kinds (contact, claim, vendor interest) and lists them by kind", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const { saveSubmission, listSubmissions } = await load();
    for (const kind of ["contact", "claim", "vendor-interest"] as const) {
      expect(saveSubmission(kind, { email: "a@example.com" }), kind).toMatchObject({ ok: true, persisted: true });
    }
    expect(listSubmissions("vendor-interest")).toHaveLength(1);
    expect(listSubmissions("claim")).toHaveLength(1);
    expect(listSubmissions()).toHaveLength(3);
  });

  it("reports persisted: false when setItem throws, and when storage is missing", async () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    vi.stubGlobal("localStorage", storage);
    let mod = await load();
    expect(mod.saveSubmission("review-draft", { product: "x" })).toMatchObject({ ok: true, persisted: false });

    vi.unstubAllGlobals();
    vi.stubGlobal("localStorage", undefined);
    mod = await load();
    expect(mod.saveSubmission("review-draft", { product: "x" })).toMatchObject({ ok: true, persisted: false });
  });

  it("replaces matching entries of the same kind once the new one is persisted", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions, SUBMISSIONS_STORAGE_KEY } = await load();

    const old = saveSubmission("review-draft", { product: "a", headline: "old" });
    const other = saveSubmission("review-draft", { product: "b" });
    const news = saveSubmission("newsletter", { product: "a" });
    const fresh = saveSubmission(
      "review-draft",
      { product: "a", headline: "new" },
      { replaceWhere: (entry) => entry.payload.product === "a" },
    );

    expect(fresh.persisted).toBe(true);
    const ids = listSubmissions().map((s) => s.id);
    expect(ids).toEqual([other.id, news.id, fresh.id]);
    expect(ids).not.toContain(old.id);
    expect(JSON.parse(storage.raw.get(SUBMISSIONS_STORAGE_KEY)!).map((s: { id: string }) => s.id)).toEqual([
      other.id,
      news.id,
      fresh.id,
    ]);
  });

  it("keeps the earlier entry when the replacement could not be persisted", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, listSubmissions } = await load();

    const old = saveSubmission("review-draft", { product: "a", headline: "old" });
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    const fresh = saveSubmission(
      "review-draft",
      { product: "a", headline: "new" },
      { replaceWhere: (entry) => entry.payload.product === "a" },
    );

    expect(fresh.persisted).toBe(false);
    // The old draft is still stored; the new one is visible for this page session only.
    expect(listSubmissions("review-draft").map((s) => s.id)).toEqual([old.id, fresh.id]);
  });
});

describe("isPersisted", () => {
  it("is true only for entries actually in storage", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, isPersisted } = await load();

    const stored = saveSubmission("review-draft", { product: "a" });
    expect(isPersisted(stored.id)).toBe(true);

    storage.setItem.mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    const memoryOnly = saveSubmission("review-draft", { product: "a" });
    expect(memoryOnly.persisted).toBe(false);
    expect(isPersisted(memoryOnly.id)).toBe(false);
    expect(isPersisted("unknown")).toBe(false);
  });

  it("is false when storage is missing or blocked entirely", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { saveSubmission, isPersisted } = await load();
    expect(isPersisted(saveSubmission("review-draft", { product: "a" }).id)).toBe(false);
  });
});

describe("removeSubmissionsWhere", () => {
  it("removes every matching entry of the kind, stored and in memory, and reports true", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, removeSubmissionsWhere, listSubmissions } = await load();

    saveSubmission("review-draft", { product: "a" });
    saveSubmission("review-draft", { product: "a" });
    const keep = saveSubmission("review-draft", { product: "b" });
    const news = saveSubmission("newsletter", { product: "a" });

    expect(removeSubmissionsWhere("review-draft", (e) => e.payload.product === "a")).toBe(true);
    expect(listSubmissions().map((s) => s.id)).toEqual([keep.id, news.id]);
  });

  it("reports false when a matching stored entry cannot be removed (failed replace edge case)", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { saveSubmission, removeSubmissionsWhere, listSubmissions } = await load();

    const old = saveSubmission("review-draft", { product: "a" });
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    saveSubmission("review-draft", { product: "a" }, { replaceWhere: (e) => e.payload.product === "a" });

    expect(removeSubmissionsWhere("review-draft", (e) => e.payload.product === "a")).toBe(false);
    // The in-memory draft is gone; the old stored one is not.
    expect(listSubmissions("review-draft").map((s) => s.id)).toEqual([old.id]);
  });

  it("is true when nothing matches", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const { removeSubmissionsWhere } = await load();
    expect(removeSubmissionsWhere("review-draft", () => true)).toBe(true);
  });
});
