import type { Article } from "../types";
import { bestSoftwareArticles } from "./articles-best";
import { blogArticles } from "./articles-blog";
import { buyingGuideArticles } from "./articles-buying";
import { guideArticles } from "./articles-guide";
import { researchArticles } from "./articles-research";

// Editorial content for the demonstration site. Articles make no claims about
// testing, user reviews or rankings; see the methodology pieces for the rules.
export const articles: Article[] = [
  ...blogArticles,
  ...guideArticles,
  ...bestSoftwareArticles,
  ...researchArticles,
  ...buyingGuideArticles,
];
