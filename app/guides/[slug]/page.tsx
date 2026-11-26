import type { Metadata } from "next";
import { ArticlePage, articleMetadata, articleStaticParams } from "@/components/editorial/ArticlePage";

// Every article is generated at build time; any other slug is a 404 (the
// proxy guard in lib/route-guards.ts makes that a real 404 status, and
// ArticlePage calls notFound() as well).
export async function generateStaticParams() {
  return articleStaticParams("guide");
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return articleMetadata("guide", slug);
}

export default async function Page({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  return <ArticlePage kind="guide" slug={slug} />;
}
