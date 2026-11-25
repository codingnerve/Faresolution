import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WhySimilar } from "@/components/alternatives/WhySimilar";
import { ProductRow } from "@/components/product/ProductRow";
import { ProfileSection } from "@/components/product/ProfileSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/alternatives">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "alternatives");
}

// The same engine as /alternatives/[product] (lib/alternatives/score.ts), so the
// two lists agree; the full page adds comparison links for each pair.
export default async function ProductAlternativesPage({ params }: PageProps<"/products/[slug]/alternatives">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product, primaryCategory, alternatives, vendorNames } = profile;

  return (
    <ProfileSection
      id="alternatives"
      title={`Alternatives to ${product.name}`}
      description={`Matched on ${primaryCategory ? `the ${primaryCategory.name} category` : "category"}, other shared categories, features, pricing model, industries and deployment. Most similar first; not a ranking by ratings.`}
    >
      {alternatives.length > 0 ? (
        <ul className="space-y-4">
          {alternatives.map(({ product: p, reasons }) => (
            <li key={p.slug}>
              <ProductRow product={p} vendorName={vendorNames.get(p.vendorSlug) ?? null} />
              <WhySimilar reasons={reasons} className="mt-2 px-1" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No alternatives listed yet"
          description={`We have not listed products similar to ${product.name} yet.`}
        />
      )}
      <Link
        href={`/alternatives/${slug}`}
        className="mt-6 inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
      >
        More on {product.name} alternatives
        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
      </Link>
    </ProfileSection>
  );
}
