import { notFound } from "next/navigation";
import { ProfileSection } from "@/components/product/ProfileSection";
import { RatingsSummary, ReviewsEmptyState } from "@/components/product/ProductReviews";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/reviews">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "reviews");
}

export default async function ProductReviewsPage({ params }: PageProps<"/products/[slug]/reviews">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product } = profile;

  return (
    <ProfileSection
      id="reviews"
      title={`${product.name} reviews`}
      description="Ratings and reviews will come only from people who use the product. None have been collected yet."
    >
      <RatingsSummary product={product} />
      <ReviewsEmptyState product={product} className="mt-6" />
    </ProfileSection>
  );
}
