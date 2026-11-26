import type { MetadataRoute } from "next";
import { getArticles, getCategories, getIndustries, getPopularComparisons, getProducts } from "@/lib/data";
import { buildSitemapEntries } from "@/lib/sitemap";

// Built from static data at build time; see lib/sitemap.ts for what is listed and why.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, industries, articles, popularComparisons] = await Promise.all([
    getProducts(),
    getCategories(),
    getIndustries(),
    getArticles(),
    getPopularComparisons(),
  ]);
  return buildSitemapEntries({ products, categories, industries, articles, popularComparisons });
}
