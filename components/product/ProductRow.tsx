import Link from "next/link";
import type { ReactNode } from "react";
import { CompareButton } from "@/components/compare/CompareButton";
import { productHref } from "@/components/layout/navigation";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { Rating } from "@/components/ui/Rating";
import { cn } from "@/lib/utils";
import { HighlightList, PricingFacts, ViewDetailsLink, type ProductCardData } from "./card-parts";

export interface ProductRowProps {
  product: ProductCardData;
  vendorName: string | null;
  headingLevel?: "h2" | "h3" | "h4";
  /** Extra controls next to "View details" (e.g. an "Add to comparison" link). */
  actions?: ReactNode;
  /** Show the Compare toggle (default true). */
  compare?: boolean;
  className?: string;
}

/**
 * List-view card: identity and highlights on the left, review status, known
 * plan facts and the profile link in a side column (stacked on small screens).
 */
export function ProductRow({
  product,
  vendorName,
  headingLevel: Heading = "h3",
  actions,
  compare = true,
  className,
}: ProductRowProps) {
  const href = productHref(product.slug);

  return (
    <article
      className={cn(
        "group relative grid gap-5 rounded-lg border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised sm:p-6 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-8",
        className,
      )}
    >
      <div className="flex min-w-0 gap-4">
        <ProductLogo name={product.name} color={product.brandColor} logo={product.logo} size={48} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <Heading className="type-h3 text-navy">
            <Link href={href} className="rounded-xs hover:text-blue-ink">
              {product.name}
            </Link>
          </Heading>
          {vendorName && <p className="type-meta mt-0.5 truncate">by {vendorName}</p>}
          <p className="mt-3 text-[0.9375rem] leading-6 text-ink">{product.tagline}</p>
          <HighlightList highlights={product.highlights} className="mt-4" />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <dl className="space-y-3">
          <div>
            <dt className="type-label">Reviews</dt>
            <dd className="mt-1">
              <Rating value={product.rating} count={product.reviewCount} />
            </dd>
          </div>
          <div>
            <dt className="type-label">Plans</dt>
            <dd className="mt-1.5">
              <PricingFacts pricing={product.pricing} />
            </dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <ViewDetailsLink href={href} name={product.name} />
          {actions}
          {compare && <CompareButton slug={product.slug} name={product.name} />}
        </div>
      </div>
    </article>
  );
}
