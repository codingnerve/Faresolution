import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PlanCards, PriceSource } from "@/components/product/PlanCards";
import { ProfileSection } from "@/components/product/ProfileSection";
import { SimilarComparison } from "@/components/product/SimilarComparison";
import { pricingModelLabel } from "@/lib/directory/labels";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";
import { cn, formatPricing, isWebUrl } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/pricing">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "pricing");
}

const NOT_VERIFIED = "Not verified";

function yesNo(value: boolean | null): string {
  return value === true ? "Available" : value === false ? "Not offered" : NOT_VERIFIED;
}

export default async function ProductPricingPage({ params }: PageProps<"/products/[slug]/pricing">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product, alternatives, vendorNames } = profile;
  const { pricing } = product;
  const website = isWebUrl(product.website) ? product.website : null;

  const facts = [
    { label: "Pricing model", value: pricing.model ? pricingModelLabel[pricing.model] : NOT_VERIFIED },
    { label: "Starting price", value: pricing.startingPrice?.trim() || NOT_VERIFIED },
    { label: "Free plan", value: yesNo(pricing.freePlan) },
    { label: "Free trial", value: yesNo(pricing.freeTrial) },
  ];

  return (
    <div className="space-y-12">
      <ProfileSection id="pricing" title={`${product.name} pricing`} description={formatPricing(product)}>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-surface p-4 sm:p-5">
              <dt className="type-label">{fact.label}</dt>
              <dd
                className={cn(
                  "mt-1.5 text-[0.9375rem]",
                  fact.value === NOT_VERIFIED ? "text-subtle" : "font-semibold text-navy",
                )}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>

        <PriceSource pricing={pricing} className="mt-4" />
      </ProfileSection>

      {pricing.plans.length > 0 && (
        <ProfileSection
          id="plans"
          title="Plans and prices"
          description={`Every ${product.name} plan, its published price and what it adds.`}
        >
          <PlanCards pricing={pricing} productName={product.name} website={website} />
        </ProfileSection>
      )}

      {alternatives.length > 0 && (
        <ProfileSection
          id="compare"
          title={`${product.name} pricing vs similar products`}
          description="Entry prices and plan facts beside the closest alternatives."
        >
          <SimilarComparison
            product={product}
            others={alternatives.slice(0, 3).map((a) => a.product)}
            vendorNames={vendorNames}
          />
        </ProfileSection>
      )}

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
        >
          Check current prices on the {product.name} website
          <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}
