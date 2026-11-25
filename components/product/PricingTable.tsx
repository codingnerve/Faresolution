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
 */
export function PricingTable({ plans, website, productName, className }: PricingTableProps) {
  if (plans.length === 0) return null;
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{productName} plans</caption>
        <thead className="hidden bg-surface-alt sm:table-header-group">
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
          {plans.map((plan) => {
            const price = plan.price?.trim();
            return (
              <tr key={plan.name} className="grid gap-1 px-5 py-4 sm:table-row sm:p-0">
                <th scope="row" className="text-[0.9375rem] font-semibold text-navy sm:px-5 sm:py-4 sm:align-top">
                  {plan.name}
                </th>
                <td className="leading-6 text-ink sm:px-5 sm:py-4 sm:align-top">{plan.summary}</td>
                <td className="sm:px-5 sm:py-4 sm:text-right sm:align-top">
                  {price ? (
                    <span className="font-medium text-ink tabular-nums">{price}</span>
                  ) : website ? (
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
                  ) : (
                    <span className="text-subtle">Not verified</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
