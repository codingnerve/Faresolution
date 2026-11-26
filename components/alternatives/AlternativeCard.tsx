import Link from "next/link";
import { CompareButton } from "@/components/compare/CompareButton";
import { compareHref, productHref } from "@/components/layout/navigation";
import { HighlightList, PricingFacts, ViewDetailsLink } from "@/components/product/card-parts";
import { buttonClasses } from "@/components/ui/Button";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { Rating } from "@/components/ui/Rating";
import type { Alternative } from "@/lib/alternatives/score";
import { WhySimilar } from "./WhySimilar";

/**
 * One alternative to `source`: identity, short description, key highlights, why
 * it was matched, review status, known plan facts, and links to the canonical
 * comparison with the source, the profile and the compare tray.
 */
export function AlternativeCard({
  alternative,
  vendorName,
  source,
}: {
  alternative: Alternative;
  vendorName: string | null;
  source: { slug: string; name: string };
}) {
  const { product, reasons } = alternative;
  const href = productHref(product.slug);

  return (
    <article className="group relative grid gap-5 rounded-lg border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised sm:p-6 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-8">
      <div className="flex min-w-0 gap-4">
        <ProductLogo name={product.name} color={product.brandColor} logo={product.logo} size={48} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="type-h3 text-navy">
            <Link href={href} className="rounded-xs hover:text-blue-ink">
              {product.name}
            </Link>
          </h3>
          {vendorName && <p className="type-meta mt-0.5 truncate">by {vendorName}</p>}
          <p className="mt-3 text-[0.9375rem] leading-6 text-ink">{product.tagline}</p>
          <HighlightList highlights={product.highlights} className="mt-4" />
          <WhySimilar reasons={reasons} className="mt-4 border-t border-line pt-3" />
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
        <div className="mt-auto flex flex-col items-start gap-3">
          <Link
            href={compareHref([source.slug, product.slug])}
            aria-label={`Compare ${product.name} with ${source.name}`}
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            Compare with {source.name}
          </Link>
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <ViewDetailsLink href={href} name={product.name} />
            <CompareButton slug={product.slug} name={product.name} />
          </div>
        </div>
      </div>
    </article>
  );
}
