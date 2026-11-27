import { ArrowUpRight, Info } from "lucide-react";
import type { Pricing } from "@/lib/data";
import { formatCheckedAt, isFreePrice, priceParts } from "@/lib/products/price";
import { cn, isWebUrl } from "@/lib/utils";

type PlanCardsProps = {
  pricing: Pricing;
  productName: string;
  /** Vendor site, linked from plans without a published price. */
  website: string | null;
  /** Show at most this many plans (the overview shows four). */
  limit?: number;
  className?: string;
};

/** A price set large with its unit small: "From $15 /user/mo". */
export function PriceDisplay({
  price,
  size = "md",
  className,
}: {
  price: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const parts = priceParts(price);
  if (!parts) {
    return (
      <p className={cn("font-semibold text-ink", size === "sm" ? "text-sm" : "text-base", className)}>
        Price on request
      </p>
    );
  }
  // A string with no leading amount ("Usage-based") reads as plain text, not a big figure.
  const plain = parts.amount.length > 12;
  const amountSize = plain
    ? "text-base"
    : size === "lg"
      ? "text-[2rem]"
      : size === "md"
        ? "text-[1.625rem]"
        : "text-lg";
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-1", className)}>
      {parts.prefix && <span className="text-[0.8125rem] font-medium text-subtle">{parts.prefix}</span>}
      <span className={cn("leading-none font-semibold tracking-[-0.02em] text-navy tabular-nums", amountSize)}>
        {parts.amount}
      </span>
      {parts.unit && <span className="text-sm text-subtle">{parts.unit}</span>}
    </p>
  );
}

/** Where the prices came from and when, under any price list. */
export function PriceSource({ pricing, className }: { pricing: Pricing; className?: string }) {
  const checked = formatCheckedAt(pricing.checkedAt);
  const source = pricing.sourceUrl && isWebUrl(pricing.sourceUrl) ? pricing.sourceUrl : null;
  if (!checked && !pricing.billingNote && !pricing.note) return null;
  return (
    <p className={cn("flex items-start gap-2.5 text-[0.8125rem] leading-5 text-subtle", className)}>
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue" strokeWidth={2} />
      <span>
        {pricing.note && <>{pricing.note} </>}
        {pricing.billingNote && <>{pricing.billingNote} </>}
        {checked && (
          <>
            From the vendor&rsquo;s published list prices, checked {checked}. Taxes and promotions excluded.{" "}
            {source && (
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xs font-medium text-blue-ink underline decoration-blue/30 underline-offset-2 hover:decoration-blue"
              >
                Source
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </>
        )}
      </span>
    </p>
  );
}

/**
 * Plans as price cards: name, published price (large), what the plan adds.
 * Plans without a published price read "Price on request" and link to the
 * vendor. Cards lift slightly on hover (transform only; none when the user
 * prefers reduced motion).
 */
export function PlanCards({ pricing, productName, website, limit, className }: PlanCardsProps) {
  const plans = limit ? pricing.plans.slice(0, limit) : pricing.plans;
  if (plans.length === 0) return null;
  const site = website && isWebUrl(website) ? website : null;

  return (
    <div className={className}>
      <ul
        aria-label={`${productName} plans`}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(11.5rem,1fr))]"
      >
        {plans.map((plan) => {
          const free = isFreePrice(plan.price);
          return (
            <li
              key={plan.name}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface p-5 shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:border-line-strong hover:shadow-raised motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span
                aria-hidden="true"
                className={cn("absolute inset-x-0 top-0 h-[3px]", free ? "bg-teal" : "bg-blue/70")}
              />
              <h3 className="text-[0.9375rem] leading-5 font-semibold text-navy">{plan.name}</h3>
              <PriceDisplay price={plan.price} className="mt-4 min-h-8" />
              <p className="mt-3 flex-1 text-sm leading-6 text-ink">{plan.summary}</p>
              {!plan.price && site && (
                <a
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 self-start rounded-xs text-[0.8125rem] font-medium text-blue-ink hover:text-navy"
                >
                  Ask {productName} for a quote
                  <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
      <PriceSource pricing={pricing} className="mt-4" />
    </div>
  );
}
