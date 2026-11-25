/**
 * Product profile tabs. The overview is the bare profile URL; every other tab
 * is a static sub-path with its own page under `app/products/[slug]/`.
 * Shared by the tab bar, the breadcrumbs and the route guard (R12).
 */

export const PRODUCT_TAB_SEGMENTS = [
  "reviews",
  "pricing",
  "features",
  "alternatives",
  "integrations",
  "screenshots",
  "faq",
] as const;

export type ProductTabSegment = (typeof PRODUCT_TAB_SEGMENTS)[number];

export interface ProductTab {
  /** `null` for the overview (the profile URL itself). */
  segment: ProductTabSegment | null;
  label: string;
}

export const PRODUCT_TABS: readonly ProductTab[] = [
  { segment: null, label: "Overview" },
  { segment: "reviews", label: "Reviews" },
  { segment: "pricing", label: "Pricing" },
  { segment: "features", label: "Features" },
  { segment: "alternatives", label: "Alternatives" },
  { segment: "integrations", label: "Integrations" },
  { segment: "screenshots", label: "Screenshots" },
  { segment: "faq", label: "FAQ" },
];

export function productTabHref(slug: string, segment: ProductTabSegment | null): string {
  return segment ? `/products/${slug}/${segment}` : `/products/${slug}`;
}

/** The tab for a layout segment, or the overview for anything else. */
export function productTabFor(segment: string | null): ProductTab {
  return PRODUCT_TABS.find((tab) => tab.segment === segment) ?? PRODUCT_TABS[0];
}
