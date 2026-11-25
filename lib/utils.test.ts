import { describe, expect, it } from "vitest";
import { absoluteUrl, cn, getInitials, isLightColor } from "@/lib/utils";

describe("cn", () => {
  it("drops falsy values and lets later Tailwind classes win", () => {
    const flag = false;
    expect(cn("a", flag && "b", "p-2", "p-4")).toBe("a p-4");
  });
});

describe("getInitials", () => {
  it("uses the first letters of the first two words", () => {
    expect(getInitials("Northwind Ledger Cloud")).toBe("NL");
  });

  it("uses a single letter for one-word names", () => {
    expect(getInitials("atlas")).toBe("A");
  });

  it("ignores punctuation and extra whitespace", () => {
    expect(getInitials("  (beta)   -  harbor.io ")).toBe("BH");
  });

  it("falls back to a placeholder for empty names", () => {
    expect(getInitials("   ")).toBe("?");
  });
});

describe("isLightColor", () => {
  it("detects light and dark hex colours", () => {
    expect(isLightColor("#FFFFFF")).toBe(true);
    expect(isLightColor("#F5C542")).toBe(true);
    expect(isLightColor("#17243A")).toBe(false);
    expect(isLightColor("#4169E1")).toBe(false);
  });

  it("accepts three-digit hex", () => {
    expect(isLightColor("#fff")).toBe(true);
  });

  it("treats invalid input as dark", () => {
    expect(isLightColor("not-a-colour")).toBe(false);
  });
});

describe("absoluteUrl", () => {
  it("joins paths onto the site origin", () => {
    expect(absoluteUrl("/software")).toBe("https://faresolution.com/software");
    expect(absoluteUrl("software")).toBe("https://faresolution.com/software");
  });
});
