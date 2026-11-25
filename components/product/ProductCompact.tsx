import { Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CompareButton } from "@/components/compare/CompareButton";
import { productHref } from "@/components/layout/navigation";
import { LogoMark } from "@/components/ui/LogoMark";
import { Rating } from "@/components/ui/Rating";
import { cn } from "@/lib/utils";
import { PricingFacts, ViewDetailsLink, type ProductCardData } from "./card-parts";

export interface ProductCompactProps {
  product: ProductCardData;
  vendorName: string | null;
  headingLevel?: "h2" | "h3" | "h4";
  actions?: ReactNode;
  /** Show the Compare toggle (default true). */
  compare?: boolean;
  className?: string;
}

/**
 * Dense card for sidebars and secondary lists: the same facts as a tile
 * (review status, known plan facts, up to three highlights) at a smaller size.
 */
export function ProductCompact({
  product,
  vendorName,
  headingLevel: Heading = "h3",
  actions,
  compare = true,
  className,
}: ProductCompactProps) {
  const href = productHref(product.slug);
  const highlights = product.highlights.slice(0, 3);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-line bg-surface p-4 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <LogoMark name={product.name} color={product.brandColor} size={36} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <Heading className="text-[0.9375rem] leading-5 font-semibold tracking-[-0.01em] text-navy">
            <Link href={href} className="rounded-xs hover:text-blue-ink">
              {product.name}
            </Link>
          </Heading>
          {vendorName && <p className="type-meta truncate">by {vendorName}</p>}
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink">{product.tagline}</p>

      <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center">
          <dt className="sr-only">Reviews</dt>
          <dd>
            <Rating value={product.rating} count={product.reviewCount} />
          </dd>
        </div>
        <div className="flex items-center">
          <dt className="sr-only">Plans</dt>
          <dd>
            <PricingFacts pricing={product.pricing} />
          </dd>
        </div>
      </dl>

      {highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2 text-xs leading-[1.125rem] text-subtle">
              <Check aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-blue" strokeWidth={2.5} />
              <span className="line-clamp-2">{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <ViewDetailsLink href={href} name={product.name} className="text-[0.8125rem]" />
        {(compare || actions) && (
          <div className="flex items-center gap-2">
            {actions}
            {compare && <CompareButton slug={product.slug} name={product.name} />}
          </div>
        )}
      </div>
    </article>
  );
}
