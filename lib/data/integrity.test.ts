import { describe, expect, it } from "vitest";
import { articles } from "./content/articles";
import { authors } from "./content/authors";
import { categories } from "./content/categories";
import { popularComparisons } from "./content/comparisons";
import { features } from "./content/features";
import { industries } from "./content/industries";
import { integrations } from "./content/integrations";
import { products } from "./content/products";
import { vendors } from "./content/vendors";
import type { ArticleKind } from "./types";

const LISTED_CATEGORY_SLUGS = [
  "crm-software",
  "project-management",
  "accounting-software",
  "erp-software",
  "hr-software",
  "payroll-software",
  "marketing-automation",
  "email-marketing",
  "customer-support",
  "help-desk",
  "ai-chatbots",
  "business-intelligence",
  "analytics",
  "inventory-management",
  "ecommerce",
  "website-builders",
  "cybersecurity",
  "video-conferencing",
  "document-management",
  "sales-software",
  "recruiting-software",
  "database-software",
  "collaboration-software",
  "cloud-management",
  "workflow-automation",
];

const LISTED_INDUSTRY_SLUGS = [
  "healthcare",
  "education",
  "retail",
  "finance",
  "real-estate",
  "manufacturing",
  "construction",
  "hospitality",
  "transportation",
  "legal",
  "marketing",
  "professional-services",
];

const ARTICLE_KINDS: ArticleKind[] = [
  "blog",
  "guide",
  "best-software",
  "research",
  "buying-guide",
];

const slugSet = (items: readonly { slug: string }[]) => new Set(items.map((i) => i.slug));

function expectUnique(slugs: string[], label: string) {
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  expect(dupes, `${label} duplicate slugs`).toEqual([]);
}

describe("slug uniqueness", () => {
  it("is unique in every collection", () => {
    expectUnique(products.map((p) => p.slug), "products");
    expectUnique(categories.map((c) => c.slug), "categories");
    expectUnique(industries.map((i) => i.slug), "industries");
    expectUnique(features.map((f) => f.slug), "features");
    expectUnique(integrations.map((i) => i.slug), "integrations");
    expectUnique(vendors.map((v) => v.slug), "vendors");
    expectUnique(authors.map((a) => a.slug), "authors");
    for (const kind of ARTICLE_KINDS) {
      expectUnique(
        articles.filter((a) => a.kind === kind).map((a) => a.slug),
        `articles/${kind}`,
      );
    }
  });

  it("uses URL-safe slugs, and never '-vs-' in a product slug", () => {
    const all = [
      ...products,
      ...categories,
      ...industries,
      ...features,
      ...integrations,
      ...vendors,
      ...authors,
      ...articles,
    ];
    for (const { slug } of all) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    // Compare URLs join slugs with "-vs-"; no "vs" word anywhere in a slug keeps parsing unambiguous.
    for (const p of products) expect(p.slug).not.toMatch(/(^|-)vs(-|$)/);
  });
});

describe("taxonomy", () => {
  it("has exactly the 25 listed categories and 12 industries", () => {
    expect(categories).toHaveLength(25);
    expect(slugSet(categories)).toEqual(new Set(LISTED_CATEGORY_SLUGS));
    expect(industries).toHaveLength(12);
    expect(slugSet(industries)).toEqual(new Set(LISTED_INDUSTRY_SLUGS));
  });

  it("resolves category parents, related slugs and industry recommendations", () => {
    const cats = slugSet(categories);
    for (const c of categories) {
      if (c.parentSlug !== null) expect(cats.has(c.parentSlug), `${c.slug} parent`).toBe(true);
      expect(c.parentSlug, c.slug).not.toBe(c.slug);
      for (const r of c.relatedSlugs) {
        expect(cats.has(r), `${c.slug} -> ${r}`).toBe(true);
        expect(r).not.toBe(c.slug);
      }
    }
    for (const i of industries) {
      for (const r of i.recommendedCategorySlugs) {
        expect(cats.has(r), `${i.slug} -> ${r}`).toBe(true);
      }
    }
  });

  it("gives every category at least two products and real editorial copy", () => {
    for (const c of categories) {
      const count = products.filter((p) => p.categorySlugs.includes(c.slug)).length;
      expect(count, `${c.slug} products`).toBeGreaterThanOrEqual(2);
      expect(c.intro.trim().length, `${c.slug} intro`).toBeGreaterThan(200);
      expect(c.buyingGuide.length, `${c.slug} buyingGuide`).toBeGreaterThanOrEqual(3);
      expect(c.faq.length, `${c.slug} faq`).toBeGreaterThanOrEqual(4);
    }
    expect(new Set(categories.map((c) => c.intro)).size).toBe(categories.length);
  });

  it("gives every industry at least two products and real editorial copy", () => {
    for (const i of industries) {
      const count = products.filter((p) => p.industrySlugs.includes(i.slug)).length;
      expect(count, `${i.slug} products`).toBeGreaterThanOrEqual(2);
      expect(i.intro.trim().length, `${i.slug} intro`).toBeGreaterThan(200);
      expect(i.selectionAdvice.length, `${i.slug} advice`).toBeGreaterThanOrEqual(3);
      expect(i.faq.length, `${i.slug} faq`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps SEO strings within search-result length limits", () => {
    for (const item of [...categories, ...industries]) {
      expect(item.seoTitle.length, `${item.slug} seoTitle`).toBeGreaterThan(10);
      // R13: the root template adds " | Faresolution" (15), so 45 keeps the rendered title within 60.
      expect(item.seoTitle.length, `${item.slug} seoTitle`).toBeLessThanOrEqual(45);
      expect(item.seoDescription.length, `${item.slug} seoDescription`).toBeGreaterThan(40);
      expect(item.seoDescription.length, `${item.slug} seoDescription`).toBeLessThanOrEqual(160);
    }
  });

  it("has a 35+ feature taxonomy", () => {
    expect(features.length).toBeGreaterThanOrEqual(35);
  });
});

describe("products", () => {
  it("has 55-60 products including the anchor CRMs", () => {
    expect(products.length).toBeGreaterThanOrEqual(55);
    expect(products.length).toBeLessThanOrEqual(60);
    const slugs = slugSet(products);
    expect(slugs.has("hubspot-crm")).toBe(true);
    expect(slugs.has("zoho-crm")).toBe(true);
  });

  it("resolves every cross reference", () => {
    const vendorSlugs = slugSet(vendors);
    const cats = slugSet(categories);
    const inds = slugSet(industries);
    const feats = slugSet(features);
    const ints = slugSet(integrations);
    for (const p of products) {
      expect(vendorSlugs.has(p.vendorSlug), `${p.slug} vendor ${p.vendorSlug}`).toBe(true);
      expect(p.categorySlugs, `${p.slug} primaryCategory`).toContain(p.primaryCategory);
      for (const c of p.categorySlugs) expect(cats.has(c), `${p.slug} -> ${c}`).toBe(true);
      for (const i of p.industrySlugs) expect(inds.has(i), `${p.slug} -> ${i}`).toBe(true);
      for (const f of p.featureSlugs) expect(feats.has(f), `${p.slug} -> ${f}`).toBe(true);
      for (const i of p.integrationSlugs) expect(ints.has(i), `${p.slug} -> ${i}`).toBe(true);
      for (const list of [p.categorySlugs, p.industrySlugs, p.featureSlugs, p.integrationSlugs]) {
        expect(new Set(list).size, `${p.slug} duplicate refs`).toBe(list.length);
      }
    }
  });

  it("never invents ratings, reviews, verification or prices", () => {
    for (const p of products) {
      expect(p.rating, p.slug).toBeNull();
      expect(p.reviewCount, p.slug).toBe(0);
      expect(p.verified, p.slug).toBe(false);
      expect(p.pricing.startingPrice, `${p.slug} startingPrice`).toBeNull();
      for (const plan of p.pricing.plans) {
        expect(plan.price, `${p.slug} plan ${plan.name}`).toBeNull();
      }
    }
  });

  it("has complete editorial fields", () => {
    for (const p of products) {
      expect(p.website, p.slug).toMatch(/^https:\/\//);
      expect(p.brandColor, p.slug).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(p.tagline.length, p.slug).toBeGreaterThan(10);
      expect(p.description.length, p.slug).toBeGreaterThan(80);
      expect(p.highlights.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(p.highlights.length, p.slug).toBeLessThanOrEqual(4);
      for (const list of [p.pros, p.cons]) {
        expect(list.length, p.slug).toBeGreaterThanOrEqual(2);
        expect(list.length, p.slug).toBeLessThanOrEqual(4);
      }
      expect(p.faq.length, p.slug).toBeGreaterThanOrEqual(3);
      expect(p.deployment.length, p.slug).toBeGreaterThan(0);
      expect(p.platforms.length, p.slug).toBeGreaterThan(0);
      expect(p.companySizes.length, p.slug).toBeGreaterThan(0);
      expect(p.addedAt, p.slug).toMatch(/^202[56]-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(p.addedAt)), p.slug).toBe(false);
      expect(p.pricing.plans.length, p.slug).toBeGreaterThan(0);
    }
  });

  it("uses a contiguous editor-curated trending order and a curated featured set", () => {
    const ranks = products
      .map((p) => p.trendingRank)
      .filter((r): r is number => r !== null)
      .sort((a, b) => a - b);
    expect(ranks.length).toBeGreaterThanOrEqual(10);
    expect(ranks).toEqual(ranks.map((_, i) => i + 1));
    const featured = products.filter((p) => p.featured).length;
    expect(featured).toBeGreaterThanOrEqual(10);
    expect(featured).toBeLessThanOrEqual(14);
  });
});

describe("vendors and integrations", () => {
  it("uses https websites for ALL vendors and integrations", () => {
    for (const v of vendors) expect(v.website, `vendor ${v.slug}`).toMatch(/^https:\/\//);
    for (const i of integrations) expect(i.website, `integration ${i.slug}`).toMatch(/^https:\/\//);
  });
});

describe("popular comparisons", () => {
  it("lists 8+ unique comparisons of 2-4 existing products in canonical order", () => {
    const productSlugs = slugSet(products);
    expect(popularComparisons.length).toBeGreaterThanOrEqual(8);
    for (const { slugs } of popularComparisons) {
      expect(slugs.length).toBeGreaterThanOrEqual(2);
      expect(slugs.length).toBeLessThanOrEqual(4);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs).toEqual([...slugs].sort());
      for (const s of slugs) expect(productSlugs.has(s), s).toBe(true);
    }
    const keys = popularComparisons.map((c) => c.slugs.join("|"));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("hubspot-crm|zoho-crm");
  });
});

describe("articles", () => {
  it("covers all five kinds with at least two articles each", () => {
    for (const kind of ARTICLE_KINDS) {
      expect(articles.filter((a) => a.kind === kind).length, kind).toBeGreaterThanOrEqual(2);
    }
    expect(articles.length).toBeGreaterThanOrEqual(12);
  });

  it("features a small curated set", () => {
    const featured = articles.filter((a) => a.featured).length;
    expect(featured).toBeGreaterThanOrEqual(2);
    expect(featured).toBeLessThanOrEqual(4);
  });

  it("resolves author and related slugs", () => {
    const authorSlugs = slugSet(authors);
    const productSlugs = slugSet(products);
    const categorySlugs = slugSet(categories);
    for (const a of articles) {
      expect(authorSlugs.has(a.authorSlug), `${a.slug} author`).toBe(true);
      for (const p of a.relatedProductSlugs) expect(productSlugs.has(p), `${a.slug} -> ${p}`).toBe(true);
      for (const c of a.relatedCategorySlugs) expect(categorySlugs.has(c), `${a.slug} -> ${c}`).toBe(true);
    }
  });

  it("has dates in the 2025-2026 window, updated on or after published", () => {
    for (const a of articles) {
      expect(a.publishedAt, a.slug).toMatch(/^202[56]-\d{2}-\d{2}$/);
      expect(a.updatedAt, a.slug).toMatch(/^202[56]-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(a.publishedAt)), a.slug).toBe(false);
      expect(a.updatedAt >= a.publishedAt, a.slug).toBe(true);
      expect(a.updatedAt <= "2026-11-25", a.slug).toBe(true);
    }
  });

  it("has structured, substantial bodies", () => {
    for (const a of articles) {
      const h2 = a.body.filter((b) => b.type === "h2").length;
      expect(h2, `${a.slug} h2 count`).toBeGreaterThanOrEqual(4);
      const words = a.body
        .map((b) => {
          if (b.type === "ul") return b.items.join(" ");
          if (b.type === "callout") return `${b.title ?? ""} ${b.text}`;
          return b.text;
        })
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      expect(words, `${a.slug} words`).toBeGreaterThanOrEqual(700);
      expect(words, `${a.slug} words`).toBeLessThanOrEqual(1100);
      expect(a.title.length, `${a.slug} title`).toBeGreaterThan(10);
      expect(a.excerpt.length, `${a.slug} excerpt`).toBeGreaterThan(60);
    }
  });

  it("does not repeat paragraphs across articles", () => {
    const seen = new Map<string, string>();
    for (const a of articles) {
      for (const b of a.body) {
        if (b.type !== "p") continue;
        const prior = seen.get(b.text);
        expect(prior, `"${b.text.slice(0, 50)}" in ${a.slug} repeats ${prior}`).toBeUndefined();
        seen.set(b.text, a.slug);
      }
    }
  });

  it("gives an article a short seoTitle exactly when its title is too long for the template (R13)", () => {
    // " | Faresolution" is 15 characters; rendered titles stay within 60.
    for (const a of articles) {
      const fits = a.title.length <= 45;
      if (fits) {
        expect(a.seoTitle, `${a.slug} needs no seoTitle`).toBeUndefined();
        continue;
      }
      expect(a.seoTitle, `${a.slug} needs a seoTitle`).toBeTypeOf("string");
      const seoTitle = a.seoTitle!;
      expect(seoTitle.trim(), a.slug).toBe(seoTitle);
      expect(seoTitle.length, `${a.slug} seoTitle "${seoTitle}"`).toBeGreaterThan(10);
      expect(seoTitle.length, `${a.slug} seoTitle "${seoTitle}"`).toBeLessThanOrEqual(45);
      // A real short title, not a truncation of the long one.
      expect(seoTitle, a.slug).not.toMatch(/(\.\.\.|…)$/);
    }
  });

  it("states that best-software shortlists are not review-based", () => {
    for (const a of articles.filter((x) => x.kind === "best-software")) {
      const text = JSON.stringify(a.body).toLowerCase();
      expect(text, a.slug).toContain("not based on user reviews");
      expect(text, a.slug).toMatch(/hands-on/);
      expect(text, a.slug).not.toMatch(/#\d|\bno\. ?\d|ranked \d/i);
    }
  });
});

describe("content hygiene", () => {
  it("contains no placeholder text anywhere", () => {
    const collections = { products, categories, industries, features, integrations, vendors, authors, articles, popularComparisons };
    for (const [name, items] of Object.entries(collections)) {
      expect(JSON.stringify(items).toLowerCase(), name).not.toContain("lorem");
    }
  });
});
