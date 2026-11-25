import { ArrowUpRight, CalendarCheck, PenLine } from "lucide-react";
import Link from "next/link";
import { CompareButton } from "@/components/compare/CompareButton";
import { categoryHref, reviewWriteHref } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/LogoMark";
import { Rating } from "@/components/ui/Rating";
import type { Category, Product, Vendor } from "@/lib/data";
import { isWebUrl } from "@/lib/utils";
import { SaveButton } from "./SaveButton";

type ProductHeaderProps = {
  product: Product;
  vendor: Vendor | null;
  primaryCategory: Category | null;
};

/**
 * Profile header shared by every tab: monogram, the product H1, vendor,
 * tagline, review status and the profile actions.
 */
export function ProductHeader({ product, vendor, primaryCategory }: ProductHeaderProps) {
  const website = isWebUrl(product.website) ? product.website : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
      <div className="flex min-w-0 gap-4 sm:gap-5">
        <LogoMark name={product.name} color={product.brandColor} size={64} className="size-13 sm:size-16" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {primaryCategory && (
              <Link
                href={categoryHref(primaryCategory.slug)}
                className="type-label rounded-xs hover:text-navy"
              >
                {primaryCategory.name}
              </Link>
            )}
            {!product.verified && <Badge tone="neutral">Not vendor verified</Badge>}
          </div>
          <h1 className="type-h1 mt-1.5 text-navy">{product.name}</h1>
          {vendor && <p className="type-meta mt-1">by {vendor.name}</p>}
          <p className="mt-3 max-w-2xl text-[1.0625rem] leading-7 text-ink">{product.tagline}</p>
          <div className="mt-3">
            <Rating value={product.rating} count={product.reviewCount} size="md" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 lg:justify-end">
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "primary" })}
          >
            Visit website
            <ArrowUpRight aria-hidden="true" strokeWidth={2} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        <Button href={`/contact?product=${encodeURIComponent(product.slug)}`} variant="secondary">
          <CalendarCheck aria-hidden="true" strokeWidth={1.75} />
          Request demo
        </Button>
        <Button href={reviewWriteHref(product.slug)} variant="secondary">
          <PenLine aria-hidden="true" strokeWidth={1.75} />
          Write review
        </Button>
        <SaveButton slug={product.slug} name={product.name} />
        <CompareButton slug={product.slug} name={product.name} size="md" />
      </div>
    </div>
  );
}
