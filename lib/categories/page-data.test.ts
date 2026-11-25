import { describe, expect, it } from "vitest";
import { getCategories, getProductsInCategoryTree } from "@/lib/data";
import { TOP_PRODUCT_LIMIT, getCategoryIndexData, getCategoryPageData } from "./page-data";

describe("getCategoryPageData", () => {
  it("returns null for unknown or malformed slugs", async () => {
    for (const slug of ["nope", "", "constructor", "__proto__", "CRM-Software"]) {
      expect(await getCategoryPageData(slug)).toBeNull();
    }
  });

  it("builds a page-ready bundle for every category", async () => {
    const categories = await getCategories();
    expect(categories.length).toBeGreaterThan(0);
    for (const c of categories) {
      const data = await getCategoryPageData(c.slug);
      expect(data, c.slug).not.toBeNull();
      expect(data!.category.slug).toBe(c.slug);
      expect(data!.count).toBe(data!.treeProducts.length);
      expect(data!.count, `${c.slug} has products`).toBeGreaterThan(0);
      expect(data!.topProducts.length).toBeGreaterThan(0);
      expect(data!.topProducts.length).toBeLessThanOrEqual(TOP_PRODUCT_LIMIT);
      expect(data!.related.length).toBeGreaterThan(0);
      for (const r of data!.related) expect(r.count).toBeGreaterThanOrEqual(0);
    }
  });

  it("describes a root: no parent, children with their own counts, tree-union count", async () => {
    const data = (await getCategoryPageData("crm-software"))!;
    expect(data.parent).toBeNull();
    expect(data.children.map((c) => c.category.slug)).toContain("sales-software");
    expect(data.count).toBe((await getProductsInCategoryTree("crm-software")).length);
    const slugs = data.treeProducts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("describes a leaf: parent set, no children, direct count", async () => {
    const data = (await getCategoryPageData("help-desk"))!;
    expect(data.parent?.slug).toBe("customer-support");
    expect(data.children).toEqual([]);
    expect(data.treeProducts.every((p) => p.categorySlugs.includes("help-desk"))).toBe(true);
  });

  it("picks distinct top products from the tree, featured first, then trending rank", async () => {
    for (const c of await getCategories()) {
      const data = (await getCategoryPageData(c.slug))!;
      const inTree = new Set(data.treeProducts.map((p) => p.slug));
      const slugs = data.topProducts.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const s of slugs) expect(inTree.has(s), `${c.slug}: ${s}`).toBe(true);

      const featuredFlags = data.topProducts.map((p) => p.featured);
      expect(featuredFlags, c.slug).toEqual([...featuredFlags].sort((a, b) => Number(b) - Number(a)));
      for (let i = 1; i < data.topProducts.length; i++) {
        const [a, b] = [data.topProducts[i - 1], data.topProducts[i]];
        if (a.featured !== b.featured) continue;
        const ra = a.trendingRank ?? Infinity;
        const rb = b.trendingRank ?? Infinity;
        expect(ra, `${c.slug}: ${a.slug} before ${b.slug}`).toBeLessThanOrEqual(rb);
      }
      // Nothing outside the picks outranks the last pick.
      if (data.topProducts.length === TOP_PRODUCT_LIMIT) {
        const last = data.topProducts[TOP_PRODUCT_LIMIT - 1];
        for (const p of data.treeProducts.filter((p) => !slugs.includes(p.slug))) {
          const better =
            Number(p.featured) > Number(last.featured) ||
            (p.featured === last.featured && (p.trendingRank ?? Infinity) < (last.trendingRank ?? Infinity));
          expect(better, `${c.slug}: ${p.slug} outranks ${last.slug}`).toBe(false);
        }
      }
    }
  });

  it("counts related categories like the listing does", async () => {
    const data = (await getCategoryPageData("crm-software"))!;
    for (const r of data.related) {
      expect(r.count).toBe((await getProductsInCategoryTree(r.category.slug)).length);
      expect(r.category.slug).not.toBe("crm-software");
    }
  });
});

describe("getCategoryIndexData", () => {
  it("lists every root with its children and counts", async () => {
    const roots = await getCategoryIndexData();
    const all = await getCategories();
    expect(roots.map((r) => r.category.slug)).toEqual(all.filter((c) => c.parentSlug === null).map((c) => c.slug));
    expect(roots.reduce((n, r) => n + 1 + r.children.length, 0)).toBe(all.length);
    for (const r of roots) {
      expect(r.count).toBe((await getProductsInCategoryTree(r.category.slug)).length);
      for (const c of r.children) expect(c.category.parentSlug).toBe(r.category.slug);
    }
  });
});
