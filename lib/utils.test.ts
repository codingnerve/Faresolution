import { describe, expect, it } from "vitest";
import { getProducts, type Pricing } from "@/lib/data";
import { absoluteUrl, cn, formatPricing, getInitials, isLightColor, isWebUrl } from "@/lib/utils";

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
    expect(absoluteUrl("/software")).toBe("https://faresolution.org/software");
    expect(absoluteUrl("software")).toBe("https://faresolution.org/software");
  });
});

describe("formatPricing", () => {
  const unknown: Pricing = {
    model: null,
    freePlan: null,
    freeTrial: null,
    startingPrice: null,
    note: null,
    plans: [{ name: "Pro", price: null, summary: "Paid tier." }],
  };
  const withPricing = (pricing: Partial<Pricing>) => ({ pricing: { ...unknown, ...pricing } });

  it("says pricing is not verified when nothing is known", () => {
    expect(formatPricing(withPricing({}))).toBe("Pricing not verified");
    expect(formatPricing(withPricing({ startingPrice: "   " }))).toBe("Pricing not verified");
  });

  it("names the pricing model when known", () => {
    expect(formatPricing(withPricing({ model: "subscription" }))).toBe("Subscription");
    expect(formatPricing(withPricing({ model: "custom" }))).toBe("Custom quote");
  });

  it("mentions free plan and trial facts only when they are set", () => {
    expect(formatPricing(withPricing({ model: "freemium", freePlan: true }))).toBe("Freemium · Free plan available");
    expect(formatPricing(withPricing({ model: "subscription", freePlan: false, freeTrial: true }))).toBe(
      "Subscription · No free plan · Free trial available",
    );
    expect(formatPricing(withPricing({ freeTrial: false }))).toBe("No free trial");
  });

  it("does not repeat the free plan for a free product", () => {
    expect(formatPricing(withPricing({ model: "free", freePlan: true }))).toBe("Free");
  });

  it("uses a known starting price verbatim and never invents one", () => {
    expect(formatPricing(withPricing({ model: "subscription", startingPrice: "15 USD per seat a month" }))).toBe(
      "Subscription · From 15 USD per seat a month",
    );
  });

  it("never renders null, NaN or undefined, and a currency sign only for a published price, for every catalogue product", async () => {
    for (const product of await getProducts()) {
      const text = formatPricing(product);
      expect(text, product.slug).not.toMatch(/null|NaN|undefined/);
      if (!product.pricing.startingPrice) expect(text, product.slug).not.toMatch(/\$/);
      else expect(text, product.slug).toContain(`From ${product.pricing.startingPrice}`);
      expect(text.length, product.slug).toBeGreaterThan(0);
    }
  });
});

describe("isWebUrl", () => {
  it("accepts absolute http(s) URLs only", () => {
    expect(isWebUrl("https://www.hubspot.com")).toBe(true);
    expect(isWebUrl("http://example.com/x")).toBe(true);
    expect(isWebUrl("javascript:alert(1)")).toBe(false);
    expect(isWebUrl("/relative")).toBe(false);
    expect(isWebUrl("")).toBe(false);
  });
});
