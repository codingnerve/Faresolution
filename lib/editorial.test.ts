import { describe, expect, it } from "vitest";
import { articles } from "@/lib/data/content/articles";
import type { Article, Block } from "@/lib/data/types";
import {
  ARTICLE_KINDS,
  articleHref,
  articleIndexHref,
  buildToc,
  categoryLabels,
  countWords,
  filterArticles,
  formatArticleDate,
  headingIds,
  pickLead,
  readingTime,
  relatedArticles,
  shareLinks,
  slugify,
  sortByNewest,
  toArticleCard,
} from "./editorial";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

function article(overrides: Partial<Article> & Pick<Article, "slug">): Article {
  return {
    kind: "blog",
    title: overrides.slug,
    excerpt: "",
    body: [],
    authorSlug: "priya-raman",
    categoryLabel: "General",
    publishedAt: "2026-01-01",
    updatedAt: "2026-01-01",
    relatedProductSlugs: [],
    relatedCategorySlugs: [],
    featured: false,
    ...overrides,
  };
}

describe("readingTime", () => {
  it("is 3 minutes for 450 words at 200 words per minute (rounded up)", () => {
    expect(readingTime([{ type: "p", text: words(450) }])).toBe(3);
  });

  it("is at least 1 minute, even with no words", () => {
    expect(readingTime([])).toBe(1);
    expect(readingTime([{ type: "p", text: "   " }])).toBe(1);
  });

  it("counts words in headings, paragraphs, list items and callouts (title included)", () => {
    const blocks: Block[] = [
      { type: "h2", text: "One two" },
      { type: "h3", text: "three" },
      { type: "p", text: "  four   five\nsix " },
      { type: "ul", items: ["seven eight", "nine"] },
      { type: "callout", title: "ten", text: "eleven twelve" },
      { type: "callout", text: "thirteen" },
    ];
    expect(countWords(blocks)).toBe(13);
  });

  it("is exactly 1 minute at 200 words and 2 at 201", () => {
    expect(readingTime([{ type: "p", text: words(200) }])).toBe(1);
    expect(readingTime([{ type: "p", text: words(201) }])).toBe(2);
  });
});

describe("slugify", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(slugify("The criteria we used")).toBe("the-criteria-we-used");
    expect(slugify("  What's next? (Part 2) ")).toBe("what-s-next-part-2");
    expect(slugify("Café & résumé")).toBe("cafe-resume");
  });

  it("falls back to 'section' when nothing usable is left", () => {
    expect(slugify("???")).toBe("section");
    expect(slugify("")).toBe("section");
  });
});

describe("buildToc", () => {
  it("lists h2 and h3 headings in order with their level", () => {
    const toc = buildToc([
      { type: "p", text: "Intro" },
      { type: "h2", text: "Shortlist" },
      { type: "h3", text: "HubSpot CRM" },
      { type: "ul", items: ["a"] },
      { type: "callout", title: "Note", text: "b" },
      { type: "h2", text: "Next steps" },
    ]);
    expect(toc).toEqual([
      { id: "shortlist", text: "Shortlist", level: 2 },
      { id: "hubspot-crm", text: "HubSpot CRM", level: 3 },
      { id: "next-steps", text: "Next steps", level: 2 },
    ]);
  });

  it("ignores paragraphs, lists and callouts", () => {
    expect(
      buildToc([
        { type: "p", text: "Para" },
        { type: "ul", items: ["Item"] },
        { type: "callout", title: "Heads up", text: "Callout" },
      ]),
    ).toEqual([]);
  });

  it("gives headings with the same text unique ids, suffixing -2, -3", () => {
    const toc = buildToc([
      { type: "h2", text: "Things to check" },
      { type: "h3", text: "Things to check" },
      { type: "h2", text: "Things to check" },
    ]);
    expect(toc.map((e) => e.id)).toEqual(["things-to-check", "things-to-check-2", "things-to-check-3"]);
  });

  it("never reuses an id even when a heading's own slug looks like a suffixed one", () => {
    const toc = buildToc([
      { type: "h2", text: "Plan" },
      { type: "h2", text: "Plan 2" },
      { type: "h2", text: "Plan" },
    ]);
    const ids = toc.map((e) => e.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids[0]).toBe("plan");
    expect(ids[1]).toBe("plan-2");
  });

  it("uses the same ids that headingIds gives the rendered heading blocks", () => {
    const blocks: Block[] = [
      { type: "p", text: "x" },
      { type: "h2", text: "A" },
      { type: "h3", text: "A" },
    ];
    expect(headingIds(blocks)).toEqual([null, "a", "a-2"]);
    expect(buildToc(blocks).map((e) => e.id)).toEqual(["a", "a-2"]);
  });

  it("produces unique ids for every real article", () => {
    for (const a of articles) {
      const ids = buildToc(a.body).map((e) => e.id);
      expect(new Set(ids).size, a.slug).toBe(ids.length);
    }
  });
});

describe("relatedArticles", () => {
  const self = article({
    slug: "self",
    relatedCategorySlugs: ["crm-software"],
    relatedProductSlugs: ["hubspot-crm"],
  });

  it("never includes the article itself", () => {
    const all = [self, article({ slug: "other" })];
    expect(relatedArticles(self, all)).not.toContain(self);
    expect(relatedArticles(self, all).map((a) => a.slug)).toEqual(["other"]);
  });

  it("treats the same slug under another kind as a different article", () => {
    const twin = article({ slug: "self", kind: "guide" });
    expect(relatedArticles(self, [self, twin])).toEqual([twin]);
  });

  it("prefers shared categories and products over recency and kind", () => {
    const newerSameKind = article({ slug: "newer", publishedAt: "2026-11-01" });
    const sharesCategory = article({
      slug: "shares-category",
      kind: "guide",
      publishedAt: "2025-01-01",
      relatedCategorySlugs: ["crm-software"],
    });
    const sharesProduct = article({
      slug: "shares-product",
      kind: "research",
      publishedAt: "2024-01-01",
      relatedProductSlugs: ["hubspot-crm"],
    });
    const sharesBoth = article({
      slug: "shares-both",
      kind: "research",
      publishedAt: "2023-01-01",
      relatedCategorySlugs: ["crm-software"],
      relatedProductSlugs: ["hubspot-crm"],
    });
    const result = relatedArticles(self, [newerSameKind, sharesProduct, self, sharesCategory, sharesBoth]);
    expect(result.map((a) => a.slug)).toEqual(["shares-both", "shares-category", "shares-product"]);
  });

  it("then prefers the same kind, then the newest", () => {
    const lonely = article({ slug: "lonely" });
    const otherKindNewest = article({ slug: "other-kind", kind: "guide", publishedAt: "2026-10-01" });
    const sameKindOld = article({ slug: "same-old", publishedAt: "2025-01-01" });
    const sameKindNew = article({ slug: "same-new", publishedAt: "2026-02-01" });
    expect(relatedArticles(lonely, [otherKindNewest, sameKindOld, lonely, sameKindNew]).map((a) => a.slug)).toEqual([
      "same-new",
      "same-old",
      "other-kind",
    ]);
  });

  it("is capped at the limit (default 3), deterministic and does not mutate its input", () => {
    const all = Array.from({ length: 6 }, (_, i) => article({ slug: `a${i}` }));
    const copy = [...all];
    const first = relatedArticles(all[0], all);
    expect(first).toHaveLength(3);
    expect(relatedArticles(all[0], [...all].reverse())).toEqual(first);
    expect(relatedArticles(all[0], all, 1)).toHaveLength(1);
    expect(all).toEqual(copy);
  });

  it("returns an empty list when there is nothing else", () => {
    expect(relatedArticles(self, [self])).toEqual([]);
  });

  it("finds three related pieces for every real article", () => {
    for (const a of articles) expect(relatedArticles(a, articles), a.slug).toHaveLength(3);
  });
});

describe("sortByNewest and pickLead", () => {
  const older = article({ slug: "older", publishedAt: "2025-01-01" });
  const newer = article({ slug: "newer", publishedAt: "2026-01-01" });
  const featuredOld = article({ slug: "featured-old", publishedAt: "2024-01-01", featured: true });

  it("sorts by publishedAt, newest first, without mutating", () => {
    const input = [older, newer];
    expect(sortByNewest(input).map((a) => a.slug)).toEqual(["newer", "older"]);
    expect(input.map((a) => a.slug)).toEqual(["older", "newer"]);
  });

  it("leads with the newest featured article and lists the rest newest first", () => {
    const { lead, rest } = pickLead([older, featuredOld, newer]);
    expect(lead?.slug).toBe("featured-old");
    expect(rest.map((a) => a.slug)).toEqual(["newer", "older"]);
  });

  it("leads with the newest article when none is featured, and handles an empty list", () => {
    expect(pickLead([older, newer]).lead?.slug).toBe("newer");
    expect(pickLead([])).toEqual({ lead: null, rest: [] });
  });
});

describe("filterArticles", () => {
  const items = [
    { title: "How to run a software trial", categoryLabel: "Evaluation" },
    { title: "A data migration checklist", categoryLabel: "Implementation" },
    { title: "Security questionnaire basics", categoryLabel: "Security" },
  ];

  it("returns everything for an empty or whitespace query and no label", () => {
    expect(filterArticles(items, { query: "", label: null })).toEqual(items);
    expect(filterArticles(items, { query: "   ", label: null })).toEqual(items);
  });

  it("matches title words case-insensitively, in any order", () => {
    expect(filterArticles(items, { query: "TRIAL", label: null })).toEqual([items[0]]);
    expect(filterArticles(items, { query: "checklist  migration", label: null })).toEqual([items[1]]);
  });

  it("filters by category label, combined with the query", () => {
    expect(filterArticles(items, { query: "", label: "Security" })).toEqual([items[2]]);
    expect(filterArticles(items, { query: "trial", label: "Security" })).toEqual([]);
  });

  it("treats regex characters literally and copes with very long input", () => {
    for (const query of ["(", "[", "\\", ".*", "a".repeat(600)]) {
      expect(filterArticles(items, { query, label: null }), query.slice(0, 5)).toEqual([]);
    }
  });
});

describe("routes", () => {
  it("maps every kind to its index route", () => {
    expect(articleIndexHref).toEqual({
      blog: "/blog",
      guide: "/guides",
      "best-software": "/best-software",
      research: "/research",
      "buying-guide": "/software-buying-guides",
    });
    expect(Object.keys(articleIndexHref).sort()).toEqual([...ARTICLE_KINDS].sort());
  });

  it("builds article paths under the kind's index", () => {
    expect(articleHref("buying-guide", "how-to-choose-accounting-software")).toBe(
      "/software-buying-guides/how-to-choose-accounting-software",
    );
    expect(articleHref("guide", "x")).toBe("/guides/x");
  });
});

describe("shareLinks", () => {
  it("builds X and LinkedIn share URLs from the encoded canonical URL", () => {
    const url = "https://faresolution.com/blog/a-b?x=1&y=2";
    const links = shareLinks(url, "Free plans & you: 50% off?");
    expect(links.x).toBe(
      `https://x.com/intent/tweet?text=${encodeURIComponent("Free plans & you: 50% off?")}&url=${encodeURIComponent(url)}`,
    );
    expect(links.linkedin).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    expect(new URL(links.x).searchParams.get("url")).toBe(url);
    expect(new URL(links.x).searchParams.get("text")).toBe("Free plans & you: 50% off?");
    expect(new URL(links.linkedin).searchParams.get("url")).toBe(url);
  });
});

describe("formatArticleDate", () => {
  it("formats a calendar date in UTC so it never shifts a day", () => {
    expect(formatArticleDate("2026-03-24")).toBe("Mar 24, 2026");
    expect(formatArticleDate("2025-01-01")).toBe("Jan 1, 2025");
  });

  it("returns null for an invalid date instead of 'Invalid Date'", () => {
    expect(formatArticleDate("nope")).toBeNull();
    expect(formatArticleDate("")).toBeNull();
  });
});

describe("toArticleCard and categoryLabels", () => {
  it("summarises an article with its route, labels, date and reading time", () => {
    const a = article({
      kind: "buying-guide",
      slug: "x",
      title: "T",
      publishedAt: "2026-03-24",
      body: [{ type: "p", text: words(450) }],
      featured: true,
    });
    expect(toArticleCard(a, "Priya Raman")).toEqual({
      kind: "buying-guide",
      slug: "x",
      href: "/software-buying-guides/x",
      title: "T",
      excerpt: "",
      categoryLabel: "General",
      kindLabel: "Buying guide",
      publishedAt: "2026-03-24",
      publishedLabel: "Mar 24, 2026",
      authorName: "Priya Raman",
      readingMinutes: 3,
      featured: true,
    });
  });

  it("lists distinct labels in first-seen order", () => {
    expect(categoryLabels([{ categoryLabel: "B" }, { categoryLabel: "A" }, { categoryLabel: "B" }])).toEqual(["B", "A"]);
    expect(categoryLabels([])).toEqual([]);
  });
});
