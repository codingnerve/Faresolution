import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { productHref } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { Rating } from "@/components/ui/Rating";
import type { Alternative } from "@/lib/alternatives/score";
import { cn, isWebUrl } from "@/lib/utils";
import { PriceDisplay } from "./PlanCards";

type RecommendedSoftwareProps = {
  alternatives: readonly Alternative[];
  vendorNames: ReadonlyMap<string, string>;
  className?: string;
};

/**
 * Similar products as buying cards: who makes it, what it costs to start, why
 * it is recommended here (the alternatives engine's strongest reason), and the
 * two next steps. Recommendations come from catalogue similarity only, never
 * from payment.
 */
export function RecommendedSoftware({ alternatives, vendorNames, className }: RecommendedSoftwareProps) {
  if (alternatives.length === 0) return null;
  return (
    <ul className={cn("grid gap-4 md:grid-cols-2", className)}>
      {alternatives.map(({ product: p, reasons }) => {
        const href = productHref(p.slug);
        const website = isWebUrl(p.website) ? p.website : null;
        const freePlan = p.pricing.freePlan === true;
        return (
          <li key={p.slug}>
            <article className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:border-line-strong hover:shadow-raised motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <div className="flex items-start gap-3">
                <ProductLogo name={p.name} color={p.brandColor} logo={p.logo} size={44} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base leading-5 font-semibold tracking-[-0.01em] text-navy">
                    <Link href={href} className="rounded-xs hover:text-blue-ink">
                      {p.name}
                    </Link>
                  </h3>
                  {vendorNames.get(p.vendorSlug) && (
                    <p className="type-meta truncate">by {vendorNames.get(p.vendorSlug)}</p>
                  )}
                  <Rating value={p.rating} count={p.reviewCount} className="mt-1" />
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3 rounded-md bg-surface-alt px-3.5 py-3">
                <div>
                  <p className="type-label">Starting price</p>
                  <PriceDisplay price={p.pricing.startingPrice} size="sm" className="mt-1" />
                </div>
                {freePlan && <Badge tone="success">Free plan</Badge>}
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink">{p.tagline}</p>
              {reasons[0] && (
                <p className="mt-3 flex items-start gap-2 text-[0.8125rem] leading-5 text-violet-ink">
                  <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                  <span>{reasons[0]}</span>
                </p>
              )}

              <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                <Link href={href} className={buttonClasses({ variant: "secondary", size: "sm" })} aria-label={`View ${p.name} profile`}>
                  View profile
                </Link>
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: "primary", size: "sm" })}
                  >
                    Visit website
                    <ArrowUpRight aria-hidden="true" strokeWidth={2} />
                    <span className="sr-only"> for {p.name} (opens in a new tab)</span>
                  </a>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
