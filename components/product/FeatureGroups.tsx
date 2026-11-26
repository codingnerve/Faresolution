import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type { FeatureGroup } from "@/lib/products/profile";
import { cn } from "@/lib/utils";

const featureFilterHref = (slug: string) => `/software?feature=${encodeURIComponent(slug)}`;

/**
 * The product's listed features under their taxonomy groups, each with its
 * description and a link to other products that list the same feature.
 */
export function FeatureGroups({ groups, className }: { groups: readonly FeatureGroup[]; className?: string }) {
  return (
    <div className={cn("space-y-10", className)}>
      {groups.map(({ group, features }) => (
        <section key={group} aria-label={group}>
          <h3 className="type-label mb-3 border-b border-line pb-2.5">{group}</h3>
          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.slug} className="flex gap-3">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue" strokeWidth={2.25} />
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-navy">{feature.name}</p>
                  <p className="mt-0.5 text-sm leading-6 text-subtle">{feature.description}</p>
                  <Link
                    href={featureFilterHref(feature.slug)}
                    className="mt-1 inline-flex items-center gap-1 rounded-xs text-[0.8125rem] font-medium text-blue-ink hover:text-navy"
                  >
                    Other products
                    <span className="sr-only"> with {feature.name}</span>
                    <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Compact feature chips for the overview. */
export function FeatureChips({ groups, limit = 10 }: { groups: readonly FeatureGroup[]; limit?: number }) {
  const features = groups.flatMap((g) => g.features).slice(0, limit);
  return (
    <ul className="flex flex-wrap gap-2">
      {features.map((feature) => (
        <li
          key={feature.slug}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-sm text-ink"
        >
          <Check aria-hidden="true" className="size-3.5 text-blue" strokeWidth={2.25} />
          {feature.name}
        </li>
      ))}
    </ul>
  );
}
