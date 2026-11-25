import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { productHref } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/Badge";
import { LogoMark } from "@/components/ui/LogoMark";
import { Rating } from "@/components/ui/Rating";
import type { Pricing, Product } from "@/lib/data";
import { cn } from "@/lib/utils";

export interface ProductTileProps {
  product: Product;
  /** Display name of the product's vendor (resolved by the caller). */
  vendorName: string | null;
  /** Heading level for the product name; h3 under a section h2 by default. */
  headingLevel?: "h2" | "h3" | "h4";
  /** Extra controls in the footer next to "View details" (e.g. a compare button). */
  actions?: ReactNode;
  className?: string;
}

interface PricingFact {
  label: string;
  tone: "success" | "neutral";
}

/**
 * Plan facts we actually know. Only free-plan and free-trial flags that are
 * set (true or false) are shown; prices are never derived here.
 */
function pricingFacts(pricing: Pricing): PricingFact[] {
  const facts: PricingFact[] = [];
  if (pricing.freePlan === true) facts.push({ label: "Free plan", tone: "success" });
  if (pricing.freePlan === false) facts.push({ label: "No free plan", tone: "neutral" });
  if (pricing.freeTrial === true) facts.push({ label: "Free trial", tone: "success" });
  if (pricing.freeTrial === false) facts.push({ label: "No free trial", tone: "neutral" });
  return facts;
}

/**
 * Grid card for a product: monogram, name, vendor, tagline, review status,
 * known plan facts and up to three highlights, linking to the profile.
 */
export function ProductTile({
  product,
  vendorName,
  headingLevel: Heading = "h3",
  actions,
  className,
}: ProductTileProps) {
  const href = productHref(product.slug);
  const facts = pricingFacts(product.pricing);
  const highlights = product.highlights.slice(0, 3);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <LogoMark name={product.name} color={product.brandColor} size={44} />
        <div className="min-w-0 flex-1">
          <Heading className="type-h3 text-navy">
            <Link href={href} className="rounded-xs hover:text-blue-ink">
              {product.name}
            </Link>
          </Heading>
          {vendorName && <p className="type-meta mt-0.5 truncate">by {vendorName}</p>}
        </div>
      </div>

      <p className="mt-4 text-[0.9375rem] leading-6 text-ink">{product.tagline}</p>

      <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3">
        <div className="flex items-center">
          <dt className="sr-only">Reviews</dt>
          <dd>
            <Rating value={product.rating} count={product.reviewCount} />
          </dd>
        </div>
        <div className="flex items-center">
          <dt className="sr-only">Plans</dt>
          <dd className="flex flex-wrap gap-1.5">
            {facts.length > 0 ? (
              facts.map((fact) => (
                <Badge key={fact.label} tone={fact.tone}>
                  {fact.label}
                </Badge>
              ))
            ) : (
              <span className="type-meta">Pricing not verified</span>
            )}
          </dd>
        </div>
      </dl>

      {highlights.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2.5 text-[0.8125rem] leading-5 text-subtle">
              <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.25} />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <Link
          href={href}
          aria-label={`View details for ${product.name}`}
          className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
        >
          View details
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
        {actions}
      </div>
    </article>
  );
}
