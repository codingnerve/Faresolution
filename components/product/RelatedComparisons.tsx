import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { compareHref } from "@/components/layout/navigation";
import { ProductLogo } from "@/components/ui/ProductLogo";
import type { ProfileComparison } from "@/lib/products/profile";
import { cn } from "@/lib/utils";

/** Editor-picked comparisons that include this product, as paired-logo rows. */
export function RelatedComparisons({
  comparisons,
  className,
}: {
  comparisons: readonly ProfileComparison[];
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-line border-y border-line", className)}>
      {comparisons.map((comparison) => {
        const names = comparison.products.map((p) => p.name);
        return (
          <li key={comparison.slugs.join("|")}>
            <Link
              href={compareHref(comparison.slugs)}
              className="group flex items-center gap-4 rounded-xs py-4"
            >
              <span aria-hidden="true" className="flex shrink-0 -space-x-1">
                {comparison.products.map((p) => (
                  <ProductLogo key={p.slug} name={p.name} color={p.brandColor} logo={p.logo} size={32} className="ring-2 ring-surface rounded-md" />
                ))}
              </span>
              <span className="min-w-0 flex-1 text-[0.9375rem] font-medium text-navy group-hover:text-blue-ink">
                {names.join(" vs ")}
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
