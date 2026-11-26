import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { productHref } from "@/components/layout/navigation";
import { ProductLogo } from "@/components/ui/ProductLogo";
import type { Product } from "@/lib/data";
import type { ProfileIntegration } from "@/lib/products/profile";
import { cn, isWebUrl } from "@/lib/utils";

type IntegrationGridProps = {
  integrations: readonly ProfileIntegration[];
  /** Products by slug, for integrations that have their own profile here. */
  products: ReadonlyMap<string, Pick<Product, "name" | "brandColor" | "logo">>;
  className?: string;
};

/**
 * Integrations listed for a product. One with its own profile here links to
 * it; any other links to the integration's website.
 */
export function IntegrationGrid({ integrations, products, className }: IntegrationGridProps) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}>
      {integrations.map(({ integration, productSlug }) => {
        const profile = productSlug ? products.get(productSlug) : undefined;
        const external = !profile && isWebUrl(integration.website);
        const body = (
          <>
            <ProductLogo name={integration.name} color={profile?.brandColor ?? "#22324D"} logo={profile?.logo} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9375rem] font-semibold text-navy">{integration.name}</span>
              <span className="type-meta block">{profile ? "Profile on Faresolution" : external ? "Vendor website" : "Integration"}</span>
            </span>
            {profile ? (
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-subtle" strokeWidth={2} />
            ) : external ? (
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-subtle" strokeWidth={2} />
            ) : null}
          </>
        );
        const cardClass =
          "flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-card transition-[border-color,box-shadow] duration-200";
        return (
          <li key={integration.slug}>
            {profile && productSlug ? (
              <Link href={productHref(productSlug)} className={cn(cardClass, "hover:border-line-strong hover:shadow-raised")}>
                {body}
              </Link>
            ) : external ? (
              <a
                href={integration.website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(cardClass, "hover:border-line-strong hover:shadow-raised")}
              >
                {body}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <div className={cardClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
