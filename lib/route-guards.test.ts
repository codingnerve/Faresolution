import { describe, expect, it } from "vitest";
import { config } from "@/proxy";
import { isKnownPath, matcherCoversPrefix, routeGuards } from "./route-guards";

describe("isKnownPath", () => {
  it("is true for a known slug", () => {
    expect(isKnownPath("/categories/crm-software")).toBe(true);
    expect(isKnownPath("/categories/help-desk")).toBe(true);
  });

  it("is false for an unknown slug", () => {
    expect(isKnownPath("/categories/nope")).toBe(false);
  });

  it("never resolves prototype keys", () => {
    expect(isKnownPath("/categories/__proto__")).toBe(false);
    expect(isKnownPath("/categories/constructor")).toBe(false);
    expect(isKnownPath("/categories/toString")).toBe(false);
  });

  it("is false for a malformed escape", () => {
    expect(isKnownPath("/categories/%E0%A4%A")).toBe(false);
  });

  it("is false for an encoded slash (no second segment smuggled in)", () => {
    expect(isKnownPath("/categories/a%2Fb")).toBe(false);
    expect(isKnownPath("/categories/crm-software%2Fx")).toBe(false);
  });

  it("is false for extra segments", () => {
    expect(isKnownPath("/categories/crm-software/extra")).toBe(false);
    expect(isKnownPath("/categories/x/extra")).toBe(false);
  });

  it("is case sensitive", () => {
    expect(isKnownPath("/categories/CRM-software")).toBe(false);
  });

  it("decodes escapes of a real slug", () => {
    expect(isKnownPath("/categories/crm%2Dsoftware")).toBe(true);
  });

  it("is null when no guard applies", () => {
    for (const path of ["/", "/software", "/categories", "/software/free", "/unknown/thing"]) {
      expect(isKnownPath(path), path).toBeNull();
    }
  });
});

describe("matcherCoversPrefix", () => {
  it("matches a dynamic-segment matcher with the same prefix", () => {
    expect(matcherCoversPrefix(["/categories/:slug"], "/categories/")).toBe(true);
    expect(matcherCoversPrefix(["/a/:x", "/categories/:slug*"], "/categories/")).toBe(true);
  });

  it("rejects other prefixes and static matchers", () => {
    expect(matcherCoversPrefix(["/products/:slug"], "/categories/")).toBe(false);
    expect(matcherCoversPrefix(["/categories/crm"], "/categories/")).toBe(false);
    expect(matcherCoversPrefix([], "/categories/")).toBe(false);
  });
});

describe("proxy matcher", () => {
  it("covers every guard prefix, so a new guard cannot be forgotten in proxy.ts", () => {
    const matchers = Array.isArray(config.matcher) ? config.matcher : [config.matcher];
    for (const guard of routeGuards) {
      expect(matcherCoversPrefix(matchers as string[], guard.prefix), guard.prefix).toBe(true);
    }
  });
});
