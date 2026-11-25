import { notFound } from "next/navigation";
import { ProfileSection } from "@/components/product/ProfileSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { Faq } from "@/components/ui/Faq";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/faq">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "faq");
}

// FAQPage JSON-LD is on the overview, which shows the same questions: repeated
// FAQ content should be marked up only once.
export default async function ProductFaqPage({ params }: PageProps<"/products/[slug]/faq">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product } = profile;

  return (
    <ProfileSection
      id="faq"
      title={`${product.name} FAQ`}
      description="Answers from public product information. Confirm details with the vendor before you buy."
    >
      {product.faq.length > 0 ? (
        <Faq items={product.faq} />
      ) : (
        <EmptyState title="No questions listed yet" description={`We have not added questions about ${product.name} yet.`} />
      )}
    </ProfileSection>
  );
}
