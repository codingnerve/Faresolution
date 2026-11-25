import { describe, expect, it } from "vitest";
import { directoryHref, effectiveQuery, urlQuery } from "./preset";
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
