import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type StorageModule = typeof import("./storage");

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
async function load(): Promise<StorageModule> {
  vi.resetModules();
  return import("./storage");
}

const KEY = "faresolution:test-list";

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readList", () => {
  it("returns the stored string array", async () => {
    vi.stubGlobal("localStorage", createStorage({ [KEY]: JSON.stringify(["a", "b"]) }));
    const { readList } = await load();
    expect(readList(KEY)).toEqual(["a", "b"]);
  });

  it("returns [] when nothing is stored", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const { readList } = await load();
    expect(readList(KEY)).toEqual([]);
  });

  it("returns [] when getItem throws", async () => {
    const storage = createStorage();
    storage.getItem.mockImplementation(() => {
      throw new DOMException("Denied", "SecurityError");
    });
    vi.stubGlobal("localStorage", storage);
    const { readList } = await load();
    expect(readList(KEY)).toEqual([]);
  });

  it("returns [] for invalid JSON", async () => {
    vi.stubGlobal("localStorage", createStorage({ [KEY]: "{bad" }));
    const { readList } = await load();
    expect(readList(KEY)).toEqual([]);
  });

  it("returns [] for JSON that is not an array", async () => {
    vi.stubGlobal("localStorage", createStorage({ [KEY]: '{"a":1}' }));
    const { readList } = await load();
    expect(readList(KEY)).toEqual([]);
  });

  it("returns [] for an array holding anything but strings", async () => {
    vi.stubGlobal("localStorage", createStorage({ [KEY]: JSON.stringify(["a", 1, null]) }));
    const { readList } = await load();
    expect(readList(KEY)).toEqual([]);
  });

  it("returns [] when localStorage is missing", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { readList } = await load();
    expect(readList(KEY)).toEqual([]);
  });

  it("returns [] when accessing localStorage itself throws", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Access denied", "SecurityError");
      },
    });
    try {
      const { readList, writeList } = await load();
      expect(readList(KEY)).toEqual([]);
      expect(() => writeList(KEY, ["x"])).not.toThrow();
      expect(readList(KEY)).toEqual(["x"]);
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });

  it("returns a copy that callers cannot use to change the stored list", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { readList, writeList } = await load();
    const input = ["a"];
    writeList(KEY, input);
    input.push("mutated");
    readList(KEY).push("also mutated");
    expect(readList(KEY)).toEqual(["a"]);
  });
});

describe("writeList", () => {
  it("persists JSON to localStorage", async () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { readList, writeList } = await load();
    writeList(KEY, ["a", "b"]);
    expect(JSON.parse(storage.raw.get(KEY)!)).toEqual(["a", "b"]);
    expect(readList(KEY)).toEqual(["a", "b"]);
  });

  it("does not throw when setItem throws, and readList then returns the in-memory value", async () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    vi.stubGlobal("localStorage", storage);
    const { readList, writeList } = await load();
    expect(() => writeList(KEY, ["hubspot-crm"])).not.toThrow();
    expect(readList(KEY)).toEqual(["hubspot-crm"]);
  });

  it("keeps working in memory when localStorage is missing", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { readList, writeList } = await load();
    writeList(KEY, ["a"]);
    writeList(KEY, ["a", "b"]);
    expect(readList(KEY)).toEqual(["a", "b"]);
  });

  it("replaces a corrupt stored value", async () => {
    const storage = createStorage({ [KEY]: "{bad" });
    vi.stubGlobal("localStorage", storage);
    const { readList, writeList } = await load();
    writeList(KEY, ["a"]);
    expect(readList(KEY)).toEqual(["a"]);
    expect(storage.raw.get(KEY)).toBe('["a"]');
  });

  it("goes back to localStorage once a later write succeeds", async () => {
    const storage = createStorage();
    let failing = true;
    storage.setItem.mockImplementation((key: string, value: string) => {
      if (failing) throw new DOMException("Quota exceeded", "QuotaExceededError");
      storage.raw.set(key, value);
    });
    vi.stubGlobal("localStorage", storage);
    const { readList, writeList } = await load();
    writeList(KEY, ["memory"]);
    failing = false;
    writeList(KEY, ["persisted"]);
    // Another tab changes the stored value: it is read, not shadowed by memory.
    storage.raw.set(KEY, JSON.stringify(["other-tab"]));
    expect(readList(KEY)).toEqual(["other-tab"]);
  });

  it("keeps keys independent", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { readList, writeList } = await load();
    writeList("one", ["a"]);
    writeList("two", ["b"]);
    expect(readList("one")).toEqual(["a"]);
    expect(readList("two")).toEqual(["b"]);
  });
});

describe("readJson / writeJson", () => {
  it("round-trips values and never throws", async () => {
    const storage = createStorage({ broken: "{bad" });
    vi.stubGlobal("localStorage", storage);
    const { readJson, writeJson } = await load();
    expect(readJson("broken")).toBeNull();
    expect(readJson("missing")).toBeNull();
    expect(writeJson("k", { a: 1 })).toBe(true);
    expect(readJson("k")).toEqual({ a: 1 });
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(writeJson("c", circular)).toBe(false);
  });

  it("reports false when storage is missing", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { readJson, writeJson } = await load();
    expect(writeJson("k", 1)).toBe(false);
    expect(readJson("k")).toBeNull();
  });
});

describe("subscribeList / getListSnapshot", () => {
  it("returns the same array until the list changes (stable for useSyncExternalStore)", async () => {
    vi.stubGlobal("localStorage", createStorage({ [KEY]: '["a"]' }));
    const { getListSnapshot, writeList } = await load();
    const first = getListSnapshot(KEY);
    expect(getListSnapshot(KEY)).toBe(first);
    writeList(KEY, ["a", "b"]);
    const second = getListSnapshot(KEY);
    expect(second).not.toBe(first);
    expect(second).toEqual(["a", "b"]);
    expect(getListSnapshot(KEY)).toBe(second);
  });

  it("has a stable empty server snapshot", async () => {
    const { getServerListSnapshot } = await load();
    expect(getServerListSnapshot()).toEqual([]);
    expect(getServerListSnapshot()).toBe(getServerListSnapshot());
  });

  it("notifies subscribers of the same key on write, and stops after unsubscribe", async () => {
    vi.stubGlobal("localStorage", undefined);
    const { subscribeList, writeList } = await load();
    const onKey = vi.fn();
    const onOther = vi.fn();
    const unsubscribe = subscribeList(KEY, onKey);
    subscribeList("other", onOther);
    writeList(KEY, ["a"]);
    expect(onKey).toHaveBeenCalledTimes(1);
    expect(onOther).not.toHaveBeenCalled();
    unsubscribe();
    writeList(KEY, ["b"]);
    expect(onKey).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers when another tab changes the key", async () => {
    const target = new EventTarget();
    vi.stubGlobal("window", target);
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    const { subscribeList, getListSnapshot } = await load();
    const listener = vi.fn();
    const unsubscribe = subscribeList(KEY, listener);

    storage.raw.set(KEY, '["from-other-tab"]');
    const event = Object.assign(new Event("storage"), { key: KEY });
    target.dispatchEvent(event);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getListSnapshot(KEY)).toEqual(["from-other-tab"]);

    target.dispatchEvent(Object.assign(new Event("storage"), { key: "unrelated" }));
    expect(listener).toHaveBeenCalledTimes(1);

    // `key: null` means storage was cleared.
    target.dispatchEvent(Object.assign(new Event("storage"), { key: null }));
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    target.dispatchEvent(Object.assign(new Event("storage"), { key: KEY }));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("list helpers", () => {
  it("adds without duplicates, removes and toggles", async () => {
    vi.stubGlobal("localStorage", createStorage());
    const { addToList, readList, removeFromList, toggleInList } = await load();
    addToList(KEY, "a");
    addToList(KEY, "a");
    addToList(KEY, "b");
    expect(readList(KEY)).toEqual(["a", "b"]);
    removeFromList(KEY, "a");
    expect(readList(KEY)).toEqual(["b"]);
    expect(toggleInList(KEY, "c")).toBe(true);
    expect(toggleInList(KEY, "b")).toBe(false);
    expect(readList(KEY)).toEqual(["c"]);
  });

  it("still toggles when storage throws on every call", async () => {
    const storage = createStorage();
    storage.getItem.mockImplementation(() => {
      throw new Error("SecurityError");
    });
    storage.setItem.mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.stubGlobal("localStorage", storage);
    const { readList, toggleInList } = await load();
    expect(toggleInList(KEY, "hubspot-crm")).toBe(true);
    expect(readList(KEY)).toEqual(["hubspot-crm"]);
    expect(toggleInList(KEY, "hubspot-crm")).toBe(false);
    expect(readList(KEY)).toEqual([]);
  });
});
