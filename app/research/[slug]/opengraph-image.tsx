import { articleStaticParams } from "@/components/editorial/ArticlePage";
import { renderArticleOgImage } from "@/lib/og/article";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/render";

export const alt = "Software research on Faresolution";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return articleStaticParams("research");
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderArticleOgImage("research", slug);
}
