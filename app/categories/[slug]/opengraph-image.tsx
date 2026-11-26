import { getCategoryPageData } from "@/lib/categories/page-data";
import { getCategories } from "@/lib/data";
import { OG_CONTENT_TYPE, OG_SIZE, renderDefaultOgImage, renderPageOgImage } from "@/lib/og/render";

export const alt = "Software category on Faresolution";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCategoryPageData(slug);
  if (!data) return renderDefaultOgImage();

  const { category, count } = data;
  return renderPageOgImage({
    kindLabel: "Category",
    title: category.name,
    subtitle: `${count} ${count === 1 ? "product" : "products"} listed with buying guide and FAQs`,
  });
}
