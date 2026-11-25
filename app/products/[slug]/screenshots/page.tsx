import { notFound } from "next/navigation";
import { ProfileSection } from "@/components/product/ProfileSection";
import { ScreenshotFrame } from "@/components/product/ScreenshotFrame";
import { productTabMetadata } from "@/lib/products/metadata";
import { getProductProfile } from "@/lib/products/profile";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/screenshots">) {
  const { slug } = await params;
  return productTabMetadata(await getProductProfile(slug), "screenshots");
}

export default async function ProductScreenshotsPage({ params }: PageProps<"/products/[slug]/screenshots">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();
  const { product } = profile;

  return (
    <ProfileSection id="screenshots" title={`${product.name} screenshots`}>
      <ScreenshotFrame name={product.name} />
    </ProfileSection>
  );
}
