import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { compareHref, productHref } from "@/components/layout/navigation";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { buildRows, NOT_VERIFIED } from "@/lib/compare/diff";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PlanCards";

/** The fact rows worth a glance on a profile; the full table lives on /compare. */
const ROW_KEYS = ["pricingModel", "freePlan", "freeTrial", "deployment", "platforms", "companySize"] as const;

type SimilarComparisonProps = {
  product: Product;
  /** Up to three similar products, most similar first. */
  others: readonly Product[];
  vendorNames: ReadonlyMap<string, string>;
  className?: string;
};

/**
 * This product beside its closest alternatives: starting price first (the
 * question most buyers arrive with), then the plan and platform facts. The
 * first column sticks while the table scrolls sideways on narrow screens, so
 * the page itself never scrolls horizontally.
 */
export function SimilarComparison({ product, others, vendorNames, className }: SimilarComparisonProps) {
  const products = [product, ...others.slice(0, 3)];
  if (products.length < 2) return null;
  const rows = buildRows(products).filter((row) => (ROW_KEYS as readonly string[]).includes(row.key));
  const sticky = "sticky left-0 z-10 bg-surface shadow-[1px_0_0_var(--color-line)]";
  const current = "bg-blue-tint/50";

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-line shadow-card">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            {product.name} compared with {others.map((p) => p.name).join(", ")}
          </caption>
          <thead>
            <tr className="border-b border-line">
              <td className={cn(sticky, "w-[9.5rem] px-4 py-4")} />
              {products.map((p, i) => (
                <th key={p.slug} scope="col" className={cn("px-4 py-4 align-top font-normal", i === 0 && current)}>
                  <div className="flex items-center gap-2.5">
                    <ProductLogo name={p.name} color={p.brandColor} logo={p.logo} size={32} className="shrink-0" />
                    <div className="min-w-0">
                      {i === 0 ? (
                        <span className="block text-[0.9375rem] leading-5 font-semibold text-navy">{p.name}</span>
                      ) : (
                        <Link
                          href={productHref(p.slug)}
                          className="block rounded-xs text-[0.9375rem] leading-5 font-semibold text-navy hover:text-blue-ink"
                        >
                          {p.name}
                        </Link>
                      )}
                      <span className="type-meta block truncate">{vendorNames.get(p.vendorSlug) ?? ""}</span>
                    </div>
                  </div>
                  {i === 0 && (
                    <Badge tone="blue" className="mt-2">
                      You are viewing
                    </Badge>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <th scope="row" className={cn(sticky, "type-label px-4 py-4 align-top")}>
                Starting price
              </th>
              {products.map((p, i) => (
                <td key={p.slug} className={cn("px-4 py-4 align-top", i === 0 && current)}>
                  <PriceDisplay price={p.pricing.startingPrice} size="sm" />
                </td>
              ))}
            </tr>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row" className={cn(sticky, "type-label px-4 py-3.5 align-top")}>
                  {row.label}
                </th>
                {row.cells.map((cell, i) => (
                  <td
                    key={products[i].slug}
                    className={cn(
                      "px-4 py-3.5 align-top leading-6",
                      cell === NOT_VERIFIED ? "text-subtle" : "text-ink",
                      i === 0 && current,
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className={cn(sticky, "px-4 py-4")} />
              {products.map((p, i) => (
                <td key={p.slug} className={cn("px-4 py-4", i === 0 && current)}>
                  {i > 0 && (
                    <Link
                      href={compareHref([product.slug, p.slug])}
                      className="group inline-flex items-center gap-1 rounded-xs text-[0.8125rem] font-medium text-blue-ink hover:text-navy"
                      aria-label={`Compare ${product.name} vs ${p.name}`}
                    >
                      Compare
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="type-meta">Facts from public product information. Prices are each vendor&rsquo;s published entry price.</p>
        <Link href={compareHref(products.map((p) => p.slug))} className={buttonClasses({ variant: "secondary", size: "sm" })}>
          Compare all {products.length} side by side
          <ArrowRight aria-hidden="true" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
