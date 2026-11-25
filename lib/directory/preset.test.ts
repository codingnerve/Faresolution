import { describe, expect, it } from "vitest";
import { directoryHref, effectiveQuery, isPageOnlyChange, urlQuery } from "./preset";
import { DEFAULT_QUERY, parseQuery, type DirectoryQuery } from "./query";

const q = (o: Partial<DirectoryQuery> = {}): DirectoryQuery => ({ ...DEFAULT_QUERY, ...o });

describe("effectiveQuery", () => {
  it("applies locked values over the URL", () => {
    const parsed = parseQuery({ sort: "name", freePlan: "false", q: "crm" });
    expect(effectiveQuery(parsed, { sort: "trending", freePlan: true }, { ratingsAvailable: true })).toMatchObject({
      sort: "trending",
      freePlan: true,
      q: "crm",
    });
  });

  it("ignores rating filter and sort while no product has a rating", () => {
    const parsed = parseQuery({ sort: "rating", minRating: "4" });
    const query = effectiveQuery(parsed, undefined, { ratingsAvailable: false });
    expect(query.sort).toBe("relevance");
    expect(query.minRating).toBeUndefined();
    expect(effectiveQuery(parsed, undefined, { ratingsAvailable: true })).toMatchObject({ sort: "rating", minRating: 4 });
  });
});

describe("effectiveQuery with allowedCategories (category pages)", () => {
  const allowed = ["sales-software"];

  it("keeps a category inside the scope", () => {
    const query = effectiveQuery(parseQuery({ category: "sales-software" }), undefined, {
      ratingsAvailable: true,
      allowedCategories: allowed,
    });
    expect(query.category).toBe("sales-software");
  });

  it("drops the scope category itself (it is the whole listing, not a filter)", () => {
    const query = effectiveQuery(parseQuery({ category: "crm-software" }), undefined, {
      ratingsAvailable: true,
      allowedCategories: allowed,
    });
    expect(query.category).toBeUndefined();
  });

  it("drops a category outside the scope so users cannot filter out of the page", () => {
    const query = effectiveQuery(parseQuery({ category: "help-desk", q: "x" }), undefined, {
      ratingsAvailable: true,
      allowedCategories: allowed,
    });
    expect(query.category).toBeUndefined();
    expect(query.q).toBe("x");
  });

  it("leaves the category alone without a scope", () => {
    expect(
      effectiveQuery(parseQuery({ category: "help-desk" }), undefined, { ratingsAvailable: true }).category,
    ).toBe("help-desk");
  });
});

describe("isPageOnlyChange", () => {
  it("is true when only the page changes", () => {
    expect(isPageOnlyChange(q({ page: 1, freePlan: true }), q({ page: 2, freePlan: true }))).toBe(true);
    expect(isPageOnlyChange(q({ page: 3, feature: ["a", "b"] }), q({ page: 2, feature: ["a", "b"] }))).toBe(true);
  });

  it("is false when a filter, sort or view change also resets the page", () => {
    expect(isPageOnlyChange(q({ page: 2 }), q({ page: 1, freePlan: true }))).toBe(false);
    expect(isPageOnlyChange(q({ page: 2 }), q({ page: 1, sort: "newest" }))).toBe(false);
    expect(isPageOnlyChange(q({ page: 2, feature: ["a"] }), q({ page: 1 }))).toBe(false);
    expect(isPageOnlyChange(q({ page: 2 }), q({ page: 1, q: "crm" }))).toBe(false);
  });

  it("is false when nothing changes or only the view changes", () => {
    expect(isPageOnlyChange(q({ page: 2 }), q({ page: 2 }))).toBe(false);
    expect(isPageOnlyChange(q({ page: 2 }), q({ page: 2, view: "list" }))).toBe(false);
  });
});

describe("urlQuery / directoryHref", () => {
  it("leaves locked keys out of the URL", () => {
    const locked = { sort: "newest" as const, freePlan: true as const };
    expect(urlQuery(q({ sort: "newest", freePlan: true, page: 2 }), locked)).toEqual(q({ page: 2 }));
    expect(directoryHref({ basePath: "/software/new", locked }, q({ sort: "newest", freePlan: true }))).toBe(
      "/software/new",
    );
  });

  it("is the bare path for the default query and keeps other params", () => {
    expect(directoryHref({ basePath: "/software" }, q())).toBe("/software");
    expect(directoryHref({ basePath: "/software" }, q({ category: "crm-software", page: 2 }))).toBe(
      "/software?category=crm-software&page=2",
    );
  });
});
