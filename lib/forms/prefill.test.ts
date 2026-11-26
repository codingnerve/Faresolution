import { describe, expect, it } from "vitest";
import { resolvePrefillProduct } from "./prefill";

const slugs = new Set(["hubspot-crm", "asana", "monday-com"]);

describe("resolvePrefillProduct", () => {
  it("returns a known product slug", () => {
    expect(resolvePrefillProduct("hubspot-crm", slugs)).toBe("hubspot-crm");
    expect(resolvePrefillProduct("asana", ["asana"])).toBe("asana");
  });

  it("ignores surrounding whitespace", () => {
    expect(resolvePrefillProduct("  asana ", slugs)).toBe("asana");
  });

  it("returns null for a missing or empty value", () => {
    expect(resolvePrefillProduct(null, slugs)).toBeNull();
    expect(resolvePrefillProduct(undefined, slugs)).toBeNull();
    expect(resolvePrefillProduct("", slugs)).toBeNull();
    expect(resolvePrefillProduct("   ", slugs)).toBeNull();
  });

  it("returns null for an unknown product", () => {
    expect(resolvePrefillProduct("nope", slugs)).toBeNull();
    expect(resolvePrefillProduct("hubspot", slugs)).toBeNull();
  });

  it("returns null for malformed values", () => {
    for (const value of ["HubSpot-CRM", "hubspot crm", "hubspot--crm", "-asana", "../asana", "asana/", "<script>", "x".repeat(200)]) {
      expect(resolvePrefillProduct(value, slugs), value).toBeNull();
    }
  });

  it("returns null for arrays and other non-strings", () => {
    expect(resolvePrefillProduct(["hubspot-crm"], slugs)).toBeNull();
    expect(resolvePrefillProduct(["hubspot-crm", "asana"], slugs)).toBeNull();
    expect(resolvePrefillProduct(42, slugs)).toBeNull();
    expect(resolvePrefillProduct({ toString: () => "asana" }, slugs)).toBeNull();
  });

  it("never resolves object prototype keys", () => {
    expect(resolvePrefillProduct("constructor", slugs)).toBeNull();
    expect(resolvePrefillProduct("__proto__", slugs)).toBeNull();
  });
});
