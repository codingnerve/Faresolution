import { getArticle, type ArticleKind } from "@/lib/data";
import { ARTICLE_KIND_LABEL } from "@/lib/editorial";
import { renderDefaultOgImage, renderPageOgImage } from "./render";

export async function renderArticleOgImage(kind: ArticleKind, slug: string) {
  const article = await getArticle(kind, slug);
  if (!article) return renderDefaultOgImage();
  return renderPageOgImage({
    kindLabel: ARTICLE_KIND_LABEL[kind],
    title: article.title,
    subtitle: article.categoryLabel,
  });
}
