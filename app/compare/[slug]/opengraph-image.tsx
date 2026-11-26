import { getComparePage, getPopularCompareSlugs } from "@/lib/compare/page-data";
import { OG_CONTENT_TYPE, OG_SIZE, renderDefaultOgImage, renderPageOgImage } from "@/lib/og/render";

export const alt = "Side-by-side software comparison on Faresolution";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getPopularCompareSlugs();
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getComparePage(slug);
  if (result.kind !== "ok") return renderDefaultOgImage();

  const { versusLabel, items } = result.data;
  return renderPageOgImage({
    kindLabel: "Comparison",
    title: versusLabel,
    subtitle: "Side-by-side plans, deployment, platforms, features and integrations",
    monograms: items.map(({ product }) => ({ name: product.name, color: product.brandColor })),
  });
}
