import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { categoryHref } from "@/components/layout/navigation";
import type { CategoryCount } from "@/lib/categories/page-data";

/** Compact link list of neighbouring categories with their product counts. */
export function RelatedCategories({ items }: { items: readonly CategoryCount[] }) {
  return (
    <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
      {items.map(({ category, count }) => (
        <li key={category.slug} className="border-b border-line">
          <Link
            href={categoryHref(category.slug)}
            className="group flex items-center justify-between gap-4 rounded-xs py-3.5 text-ink hover:text-blue-ink"
          >
            <span className="font-medium">{category.name}</span>
            <span className="flex items-center gap-2 text-sm text-subtle tabular-nums">
              {count} {count === 1 ? "product" : "products"}
              <ArrowUpRight aria-hidden="true" className="size-4 text-muted group-hover:text-blue-ink" strokeWidth={1.75} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
