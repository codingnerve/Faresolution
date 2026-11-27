import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import type { Product } from "@/lib/data";
import { pricingModelLabel } from "@/lib/directory/labels";
import { formatCheckedAt } from "@/lib/products/price";
import { productTabHref } from "@/lib/products/tabs";
import { cn, isWebUrl } from "@/lib/utils";
import { PriceDisplay } from "./PlanCards";

/**
 * Sidebar pricing card, the first thing beside every profile tab: starting
 * price, pricing model, free plan / trial, and the two next steps (vendor site
 * and the full plan list).
 */
export function PriceGlance({ product, className }: { product: Product; className?: string }) {
  const { pricing } = product;
  const website = isWebUrl(product.website) ? product.website : null;
  const checked = formatCheckedAt(pricing.checkedAt);
  const freePlan = pricing.freePlan === true || pricing.plans.some((p) => p.price?.trim().toLowerCase() === "free");

  return (
    <section
      aria-labelledby="price-glance-title"
      className={cn("overflow-hidden rounded-lg border border-line bg-surface shadow-card", className)}
    >
      <div aria-hidden="true" className="brand-rule" />
      <div className="p-5">
        <h2 id="price-glance-title" className="type-label">
          Starting price
        </h2>
        <PriceDisplay price={pricing.startingPrice} size="lg" className="mt-2" />
        <p className="type-meta mt-2">
          {pricing.model ? pricingModelLabel[pricing.model] : "Pricing model not verified"}
          {checked && <> · checked {checked}</>}
        </p>

        {(freePlan || pricing.freeTrial === true) && (
          <p className="mt-3 flex flex-wrap gap-1.5">
            {freePlan && <Badge tone="success">Free plan</Badge>}
            {pricing.freeTrial === true && <Badge tone="success">Free trial</Badge>}
          </p>
        )}

        <div className="mt-5 grid gap-2">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ variant: "primary", className: "w-full" })}
            >
              Visit website
              <ArrowUpRight aria-hidden="true" strokeWidth={2} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <Link
            href={productTabHref(product.slug, "pricing")}
            className={buttonClasses({ variant: "secondary", className: "w-full" })}
          >
            See all plans
            <ArrowRight aria-hidden="true" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
