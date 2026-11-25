import { ArrowUpRight, Info } from "lucide-react";
import { notFound } from "next/navigation";
import { PricingTable } from "@/components/product/PricingTable";
import { ProfileSection } from "@/components/product/ProfileSection";
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
  const { product } = profile;
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

        {pricing.note && (
          <p className="mt-4 flex items-start gap-2.5 rounded-md border border-line bg-surface-alt px-4 py-3 text-sm leading-6 text-ink">
            <Info aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue" strokeWidth={2} />
            <span>{pricing.note}</span>
          </p>
        )}
      </ProfileSection>

      {pricing.plans.length > 0 && (
        <ProfileSection
          id="plans"
          title="Plans"
          description="Plan names and what each adds, from public product information. Prices appear only once verified."
        >
          <PricingTable plans={pricing.plans} website={website} productName={product.name} />
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
