import { describe, expect, it } from "vitest";
import { formatCheckedAt, isFreePrice, priceParts } from "./price";

describe("priceParts", () => {
  it("splits amount and unit", () => {
    expect(priceParts("$15/user/mo")).toEqual({ prefix: null, amount: "$15", unit: "/user/mo" });
    expect(priceParts("From $1,250/mo")).toEqual({ prefix: "From", amount: "$1,250", unit: "/mo" });
    expect(priceParts("From €20/mo")).toEqual({ prefix: "From", amount: "€20", unit: "/mo" });
    expect(priceParts("$49/mo + $6/person")).toEqual({ prefix: null, amount: "$49", unit: "/mo + $6/person" });
  });

  it("keeps a string with no leading amount whole, and returns null for no price", () => {
    expect(priceParts("Free")).toEqual({ prefix: null, amount: "Free", unit: null });
    expect(priceParts(null)).toBeNull();
    expect(priceParts("   ")).toBeNull();
  });
});

describe("isFreePrice", () => {
  it("is true only for a price of nothing", () => {
    expect(isFreePrice("Free")).toBe(true);
    expect(isFreePrice("$0/mo")).toBe(true);
    expect(isFreePrice("From $0/mo (usage-based)")).toBe(false);
    expect(isFreePrice("$0.99/outcome")).toBe(false);
    expect(isFreePrice(null)).toBe(false);
  });
});

describe("formatCheckedAt", () => {
  it("formats an ISO date and rejects junk", () => {
    expect(formatCheckedAt("2026-11-27")).toBe("27 Nov 2026");
    expect(formatCheckedAt("nope")).toBeNull();
    expect(formatCheckedAt(undefined)).toBeNull();
  });
});
