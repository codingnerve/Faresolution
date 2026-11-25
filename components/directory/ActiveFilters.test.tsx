import { describe, expect, it } from "vitest";
import { chipFocusTarget } from "./ActiveFilters";

describe("chipFocusTarget", () => {
  it("focuses the chip that moved into the removed chip's place", () => {
    expect(chipFocusTarget(0, 2)).toBe(0);
    expect(chipFocusTarget(1, 2)).toBe(1);
  });

  it("falls back to 'Clear all' after removing the last chip in the row", () => {
    expect(chipFocusTarget(2, 2)).toBe("clear-all");
  });

  it("falls back to the results when no chips are left", () => {
    expect(chipFocusTarget(0, 0)).toBe("fallback");
    expect(chipFocusTarget(3, 0)).toBe("fallback");
  });
});
