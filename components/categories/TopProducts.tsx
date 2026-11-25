import Link from "next/link";
import { productHref } from "@/components/layout/navigation";
import { PricingFacts, ViewDetailsLink } from "@/components/product/card-parts";
import { LogoMark } from "@/components/ui/LogoMark";
import type { Product } from "@/lib/data";

/**
 * Editor-ordered shortlist as a numbered ledger. Deliberately a list, not
 * cards: the full listing below carries the cards. The order is editorial
 * (featured, then trending rank), never review-based.
 */
export function TopProducts({
  products,
  vendorNames,
  labelledBy,
}: {
  products: readonly Product[];
  vendorNames: ReadonlyMap<string, string>;
  labelledBy: string;
}) {
  return (
    <ol aria-labelledby={labelledBy} className="divide-y divide-line border-y border-line">
      {products.map((p, index) => {
        const href = productHref(p.slug);
        const vendor = vendorNames.get(p.vendorSlug);
        return (
          <li
            key={p.slug}
            className="group grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 py-4 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-5"
          >
            <span aria-hidden="true" className="pt-0.5 font-serif text-2xl leading-8 text-muted tabular-nums sm:pt-0">
              {index + 1}
            </span>
            <div className="flex min-w-0 items-start gap-3.5">
              <LogoMark name={p.name} color={p.brandColor} size={40} className="shrink-0" />
              <div className="min-w-0">
                <h3 className="text-[1.0625rem] leading-6 font-semibold tracking-[-0.01em] text-navy">
                  <Link href={href} className="rounded-xs hover:text-blue-ink">
                    {p.name}
                  </Link>
                  {vendor && (
                    <>
                      {" "}
                      <span className="type-meta ml-1 font-normal">by {vendor}</span>
                    </>
                  )}
                </h3>
                <p className="mt-0.5 text-sm leading-5 text-ink">{p.tagline}</p>
              </div>
            </div>
            <div className="col-start-2 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 sm:col-start-3 sm:justify-end">
              <PricingFacts pricing={p.pricing} />
              <ViewDetailsLink href={href} name={p.name} className="text-[0.8125rem]" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
