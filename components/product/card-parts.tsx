import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Pricing, Product } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * The product fields every card renders. A full `Product` satisfies it, and so
 * does the directory's compact projection.
 */
export type ProductCardData = Pick<
  Product,
  "slug" | "name" | "tagline" | "brandColor" | "rating" | "reviewCount" | "highlights"
> & { pricing: Pick<Pricing, "freePlan" | "freeTrial"> };

interface PricingFact {
  label: string;
  tone: "success" | "neutral";
}

/**
 * Plan facts we actually know. Only free-plan and free-trial flags that are
 * set (true or false) are shown; prices are never derived here.
 */
export function pricingFacts(pricing: ProductCardData["pricing"]): PricingFact[] {
  const facts: PricingFact[] = [];
  if (pricing.freePlan === true) facts.push({ label: "Free plan", tone: "success" });
  if (pricing.freePlan === false) facts.push({ label: "No free plan", tone: "neutral" });
  if (pricing.freeTrial === true) facts.push({ label: "Free trial", tone: "success" });
  if (pricing.freeTrial === false) facts.push({ label: "No free trial", tone: "neutral" });
  return facts;
}

/** Known plan facts as badges, or "Pricing not verified" when nothing is known. */
export function PricingFacts({ pricing, className }: { pricing: ProductCardData["pricing"]; className?: string }) {
  const facts = pricingFacts(pricing);
  if (facts.length === 0) return <span className={cn("type-meta", className)}>Pricing not verified</span>;
  return (
    <span className={cn("flex flex-wrap gap-1.5", className)}>
      {facts.map((fact) => (
        <Badge key={fact.label} tone={fact.tone}>
          {fact.label}
        </Badge>
      ))}
    </span>
  );
}

/** Up to three key highlights with check marks. */
export function HighlightList({ highlights, className }: { highlights: string[]; className?: string }) {
  const items = highlights.slice(0, 3);
  if (items.length === 0) return null;
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((highlight) => (
        <li key={highlight} className="flex gap-2.5 text-[0.8125rem] leading-5 text-subtle">
          <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.25} />
          <span>{highlight}</span>
        </li>
      ))}
    </ul>
  );
}

/** "View details" link to the profile, labelled with the product name. */
export function ViewDetailsLink({ href, name, className }: { href: string; name: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={`View details for ${name}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy",
        className,
      )}
    >
      View details
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </Link>
  );
}
