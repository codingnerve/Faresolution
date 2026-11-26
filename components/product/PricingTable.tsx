import { ArrowUpRight } from "lucide-react";
import type { PricingPlan } from "@/lib/data";
import { cn } from "@/lib/utils";

type PricingTableProps = {
  plans: readonly PricingPlan[];
  /** Vendor site for current prices; plans without a known price link here. */
  website: string | null;
  productName: string;
  className?: string;
};

/**
 * Plans as described in the listing. A price is shown only when the data
 * states one; otherwise the row points to the vendor's site.
 *
 * Below `sm` the plans are a stacked list of cards (a description list per
 * plan); from `sm` they are a real table. Only one of the two is displayed,
 * so table semantics are never stripped by restyling rows as grids.
 */
export function PricingTable({ plans, website, productName, className }: PricingTableProps) {
  if (plans.length === 0) return null;
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line", className)}>
      <ul aria-label={`${productName} plans`} className="divide-y divide-line sm:hidden">
        {plans.map((plan) => (
          <li key={plan.name} className="px-5 py-4">
            <p className="text-[0.9375rem] font-semibold text-navy">{plan.name}</p>
            <dl className="mt-1 space-y-2 text-sm">
              <div>
                <dt className="sr-only">What it includes</dt>
                <dd className="leading-6 text-ink">{plan.summary}</dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="type-meta">Price</dt>
                <dd>
                  <PlanPrice plan={plan} website={website} />
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <table className="hidden w-full border-collapse text-left text-sm sm:table">
        <caption className="sr-only">{productName} plans</caption>
        <thead className="bg-surface-alt">
          <tr>
            <th scope="col" className="type-label w-[22%] px-5 py-3 font-medium">
              Plan
            </th>
            <th scope="col" className="type-label px-5 py-3 font-medium">
              What it includes
            </th>
            <th scope="col" className="type-label w-[24%] px-5 py-3 text-right font-medium">
              Price
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {plans.map((plan) => (
            <tr key={plan.name}>
              <th scope="row" className="px-5 py-4 align-top text-[0.9375rem] font-semibold text-navy">
                {plan.name}
              </th>
              <td className="px-5 py-4 align-top leading-6 text-ink">{plan.summary}</td>
              <td className="px-5 py-4 text-right align-top">
                <PlanPrice plan={plan} website={website} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlanPrice({ plan, website }: { plan: PricingPlan; website: string | null }) {
  const price = plan.price?.trim();
  if (price) return <span className="font-medium text-ink tabular-nums">{price}</span>;
  if (!website) return <span className="text-subtle">Not verified</span>;
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-xs font-medium text-blue-ink hover:text-navy"
    >
      See vendor site
      <ArrowUpRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
      <span className="sr-only"> for {plan.name} pricing (opens in a new tab)</span>
    </a>
  );
}
