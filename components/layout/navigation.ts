/**
 * Navigation model shared by the header, mega menu, mobile drawer and footer.
 * Every href is a route from the site plan (some are built by later tasks).
 * Plain data only, so it can be passed from server to client components.
 */
import { compareHref } from "@/lib/compare/slug";
import type { ArticleKind, CategoryNode, Industry } from "@/lib/data";

/** Comparison URL in canonical (sorted) order; `lib/compare/slug.ts`. */
export { compareHref };

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

export const resourceLinks: NavLink[] = [
  { label: "Blog", href: "/blog", description: "Notes on choosing and rolling out software" },
  { label: "Guides", href: "/guides", description: "Step-by-step help for common decisions" },
  { label: "Best software", href: "/best-software", description: "Editor shortlists by category" },
  { label: "Research", href: "/research", description: "Market overviews and buying trends" },
  {
    label: "Software buying guides",
    href: "/software-buying-guides",
    description: "What to check before you sign",
  },
];

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

/** Index route for each kind of editorial article. */
export const articleIndexHref: Record<ArticleKind, string> = {
  blog: "/blog",
  guide: "/guides",
  "best-software": "/best-software",
  research: "/research",
  "buying-guide": "/software-buying-guides",
};
export const articleHref = (kind: ArticleKind, slug: string) => `${articleIndexHref[kind]}/${slug}`;

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
