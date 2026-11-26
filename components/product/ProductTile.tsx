import Link from "next/link";
import type { ReactNode } from "react";
import { CompareButton } from "@/components/compare/CompareButton";
import { productHref } from "@/components/layout/navigation";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { Rating } from "@/components/ui/Rating";
import { cn } from "@/lib/utils";
import { HighlightList, PricingFacts, ViewDetailsLink, type ProductCardData } from "./card-parts";

export interface ProductTileProps {
  product: ProductCardData;
  /** Display name of the product's vendor (resolved by the caller). */
  vendorName: string | null;
  /** Heading level for the product name; h3 under a section h2 by default. */
  headingLevel?: "h2" | "h3" | "h4";
  /** Extra controls in the footer next to "View details" (e.g. an "Add to comparison" link). */
  actions?: ReactNode;
  /** Show the Compare toggle (default true). */
  compare?: boolean;
  className?: string;
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
  compare = true,
  className,
}: ProductTileProps) {
  const href = productHref(product.slug);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <ProductLogo name={product.name} color={product.brandColor} logo={product.logo} size={44} />
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
          <dd>
            <PricingFacts pricing={product.pricing} />
          </dd>
        </div>
      </dl>

      <HighlightList highlights={product.highlights} className="mt-4" />

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <ViewDetailsLink href={href} name={product.name} />
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
