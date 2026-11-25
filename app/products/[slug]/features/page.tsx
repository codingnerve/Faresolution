import { notFound } from "next/navigation";
import { FeatureGroups } from "@/components/product/FeatureGroups";
import { ProfileSection } from "@/components/product/ProfileSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/features">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "features");
}

export default async function ProductFeaturesPage({ params }: PageProps<"/products/[slug]/features">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product, featureGroups, featureCount } = profile;

  return (
    <ProfileSection
      id="features"
      title={`${product.name} features`}
      description={
        featureCount > 0
          ? `${featureCount} ${featureCount === 1 ? "feature" : "features"} listed from public product information, grouped by area.`
          : undefined
      }
    >
      {featureCount > 0 ? (
        <FeatureGroups groups={featureGroups} />
      ) : (
        <EmptyState title="No features listed yet" description={`We have not listed features for ${product.name} yet.`} />
      )}
    </ProfileSection>
  );
}
