import { describe, expect, it } from "vitest";
import { PLAN_CAPABILITIES, PLAN_IDS, PLAN_PRICING_STATUS, VENDOR_PLANS, planIncludes } from "./plans";

/** Every string anywhere inside a value, for copy checks. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** Every key anywhere inside a value. */
function keys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keys);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keys(inner)]);
  }
  return [];
}

describe("vendor plans config", () => {
  it("has at least two plans with unique, slug-shaped ids", () => {
    expect(VENDOR_PLANS.length).toBeGreaterThanOrEqual(2);
    const ids = VENDOR_PLANS.map((plan) => plan.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
    expect([...PLAN_IDS]).toEqual(ids);
  });

  it("has unique plan names", () => {
    const names = VENDOR_PLANS.map((plan) => plan.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has unique capability ids, and every plan only names capabilities that exist", () => {
    const ids = PLAN_CAPABILITIES.map((capability) => capability.id);
    expect(new Set(ids).size).toBe(ids.length);
    const known = new Set(ids);
    for (const plan of VENDOR_PLANS) {
      expect(plan.capabilities.length, plan.id).toBeGreaterThan(0);
      expect(new Set(plan.capabilities).size, plan.id).toBe(plan.capabilities.length);
      for (const capability of plan.capabilities) expect(known.has(capability), `${plan.id}: ${capability}`).toBe(true);
    }
  });

  it("offers every capability in at least one plan", () => {
    for (const capability of PLAN_CAPABILITIES) {
      expect(
        VENDOR_PLANS.some((plan) => planIncludes(plan, capability.id)),
        capability.id,
      ).toBe(true);
    }
  });

  it("gives every plan the audience, summary and copy the page renders", () => {
    for (const plan of VENDOR_PLANS) {
      expect(plan.name.trim(), plan.id).not.toBe("");
      expect(plan.audience.trim().length, plan.id).toBeGreaterThan(20);
      expect(plan.summary.trim().length, plan.id).toBeGreaterThan(20);
    }
    for (const capability of PLAN_CAPABILITIES) {
      expect(capability.label.trim(), capability.id).not.toBe("");
      expect(capability.description.trim().length, capability.id).toBeGreaterThan(20);
    }
  });

  it("has no price fields and no prices in any copy", () => {
    const allKeys = keys([VENDOR_PLANS, PLAN_CAPABILITIES]);
    for (const key of allKeys) expect(key).not.toMatch(/price|cost|fee|amount|currency|billing|monthly|annual/i);
    for (const text of strings([VENDOR_PLANS, PLAN_CAPABILITIES, PLAN_PRICING_STATUS])) {
      expect(text).not.toMatch(/[$€£¥₹]|\b(usd|eur|gbp)\b|\d+\s*(\/|per)\s*(mo|month|year|seat|user)/i);
      expect(text).not.toMatch(/\bfree\b/i);
    }
  });

  it("states that pricing is announced at launch", () => {
    expect(PLAN_PRICING_STATUS).toBe("Pricing announced at launch");
  });

  it("describes capabilities as planned, never as live today", () => {
    for (const text of strings([VENDOR_PLANS, PLAN_CAPABILITIES])) {
      expect(text).not.toMatch(/\b(verified|available now|live now|already)\b/i);
    }
  });

  it("planIncludes reflects the plan's capability list", () => {
    const [first] = VENDOR_PLANS;
    expect(planIncludes(first, first.capabilities[0])).toBe(true);
    expect(planIncludes(first, "not-a-capability")).toBe(false);
  });
});
