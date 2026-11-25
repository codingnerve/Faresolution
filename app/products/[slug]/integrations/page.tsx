import { Plug } from "lucide-react";
import { notFound } from "next/navigation";
import { IntegrationGrid } from "@/components/product/IntegrationGrid";
import { ProfileSection } from "@/components/product/ProfileSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProducts } from "@/lib/data";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/integrations">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "integrations");
}

export default async function ProductIntegrationsPage({ params }: PageProps<"/products/[slug]/integrations">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product, integrations } = profile;
  const products = new Map((await getProducts()).map((p) => [p.slug, p]));
  const count = integrations.length;

  return (
    <ProfileSection
      id="integrations"
      title={`${product.name} integrations`}
      description={
        count > 0
          ? `${count} ${count === 1 ? "integration" : "integrations"} listed from public product information. Check the vendor's marketplace for the current list.`
          : undefined
      }
    >
      {count > 0 ? (
        <IntegrationGrid integrations={integrations} products={products} />
      ) : (
        <EmptyState
          icon={Plug}
          title="No integrations listed yet"
          description={`We have not listed integrations for ${product.name}. The vendor's website has its current list.`}
        />
      )}
    </ProfileSection>
  );
}
