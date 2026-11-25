"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Tabs } from "@/components/ui/Tabs";
import { PRODUCT_TABS, productTabFor, productTabHref } from "@/lib/products/tabs";

/**
 * The profile's tab bar. Rendered once in the product layout; the active tab
 * comes from the child segment below `app/products/[slug]`.
 */
export function ProductTabs({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const active = productTabFor(useSelectedLayoutSegment()).segment;
  return (
    <Tabs
      label={`${name} sections`}
      className={className}
      items={PRODUCT_TABS.map((tab) => ({
        label: tab.label,
        href: productTabHref(slug, tab.segment),
        active: tab.segment === active,
      }))}
    />
  );
}

/**
 * Breadcrumbs ending in the product, or in the product and the current tab
 * (the overview is the product page itself).
 */
export function ProductBreadcrumbs({
  slug,
  items,
  className,
}: {
  slug: string;
  /** Trail up to and including the product (its `href` is used on tab pages). */
  items: BreadcrumbItem[];
  className?: string;
}) {
  const tab = productTabFor(useSelectedLayoutSegment());
  const trail: BreadcrumbItem[] = tab.segment
    ? [...items.slice(0, -1), { ...items[items.length - 1], href: productTabHref(slug, null) }, { label: tab.label }]
    : [...items.slice(0, -1), { label: items[items.length - 1].label }];
  return <Breadcrumbs items={trail} className={className} />;
}
