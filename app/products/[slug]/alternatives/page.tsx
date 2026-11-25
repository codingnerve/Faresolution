import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductRow } from "@/components/product/ProductRow";
import { ProfileSection } from "@/components/product/ProfileSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/alternatives">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "alternatives");
}

// Interim list from `similarProducts`; the alternatives task may replace the
// matching with its scoring engine.
export default async function ProductAlternativesPage({ params }: PageProps<"/products/[slug]/alternatives">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product, primaryCategory, similar, vendorNames } = profile;

  return (
    <ProfileSection
      id="alternatives"
      title={`Alternatives to ${product.name}`}
      description={`Matched on ${primaryCategory ? `the ${primaryCategory.name} category` : "category"}, other shared categories and shared features. Not a ranking by ratings.`}
    >
      {similar.length > 0 ? (
        <ul className="space-y-4">
          {similar.map((p) => (
            <li key={p.slug}>
              <ProductRow product={p} vendorName={vendorNames.get(p.vendorSlug) ?? null} />
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
