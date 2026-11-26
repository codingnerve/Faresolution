/**
 * Navigation model shared by the header, mega menu, mobile drawer and footer.
 * Every href is a route from the site plan (some are built by later tasks).
 * Plain data only, so it can be passed from server to client components.
 */
import { compareHref } from "@/lib/compare/slug";
import type { CategoryNode, Industry } from "@/lib/data";
import { ARTICLE_KINDS, ARTICLE_SECTIONS, articleHref, articleIndexHref } from "@/lib/editorial";

/** Comparison URL in canonical (sorted) order; `lib/compare/slug.ts`. */
export { compareHref };

/** Editorial routes (kind -> index path, article path); `lib/editorial.ts`. */
export { articleHref, articleIndexHref };

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** A parent category and its child categories. */
export interface NavGroup {
  label: string;
  href: string;
  links: NavLink[];
}

export interface NavModel {
  categoryGroups: NavGroup[];
  industries: NavLink[];
  resources: NavLink[];
}

/** The five editorial sections, in navigation order, from `ARTICLE_SECTIONS`. */
export const resourceLinks: NavLink[] = ARTICLE_KINDS.map((kind) => ({
  label: ARTICLE_SECTIONS[kind].title,
  href: articleIndexHref[kind],
  description: ARTICLE_SECTIONS[kind].summary,
}));

export const allResourcesLink: NavLink = { label: "All resources", href: "/resources" };
export const allCategoriesLink: NavLink = { label: "View all categories", href: "/categories" };
export const allIndustriesLink: NavLink = { label: "All industries", href: "/industries" };
export const vendorsLink: NavLink = { label: "For Vendors", href: "/vendors" };

export const categoryHref = (slug: string) => `/categories/${slug}`;
export const industryHref = (slug: string) => `/industries/${slug}`;
export const productHref = (slug: string) => `/products/${slug}`;
export const reviewWriteHref = (slug: string) => `/reviews/write/${slug}`;
export const softwareSearchHref = (query: string) =>
  `/software?q=${encodeURIComponent(query.trim())}`;

export function buildNavModel(tree: CategoryNode[], industries: Industry[]): NavModel {
  return {
    categoryGroups: tree.map((root) => ({
      label: root.name,
      href: categoryHref(root.slug),
      links: root.children.map((child) => ({ label: child.name, href: categoryHref(child.slug) })),
    })),
    industries: industries.map((industry) => ({
      label: industry.name,
      href: industryHref(industry.slug),
    })),
    resources: resourceLinks,
  };
}
