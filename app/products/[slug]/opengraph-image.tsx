import { OG_CONTENT_TYPE, OG_SIZE, renderDefaultOgImage, renderPageOgImage } from "@/lib/og/render";
import { getProductProfile, getProductSlugs } from "@/lib/products/profile";

export const alt = "Software profile on Faresolution";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getProductSlugs();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) return renderDefaultOgImage();

  const { product, primaryCategory, vendor } = profile;
  const subtitleParts = [vendor ? `by ${vendor.name}` : null, product.tagline].filter(Boolean);

  return renderPageOgImage({
    kindLabel: primaryCategory ? primaryCategory.name : "Software profile",
    title: product.name,
    subtitle: subtitleParts.join(" — "),
    monograms: [{ name: product.name, color: product.brandColor }],
  });
}
