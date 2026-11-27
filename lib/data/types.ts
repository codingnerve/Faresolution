/**
 * Data model for the Faresolution static showcase.
 *
 * Everything here is plain, serialisable data so a real API can replace the
 * content files later without changing consumers. Anything not confidently
 * known is `null` (never a guessed value).
 */

export type PricingModel =
  | "free"
  | "freemium"
  | "subscription"
  | "usage"
  | "one-time"
  | "custom";

export type Deployment = "cloud" | "on-premise" | "hybrid";
export type Platform = "web" | "ios" | "android" | "windows" | "mac" | "linux" | "api";
export type CompanySize = "solo" | "small" | "mid" | "enterprise";

export interface PricingPlan {
  name: string;
  price: string | null;
  summary: string;
}

export interface Pricing {
  model: PricingModel | null;
  freePlan: boolean | null;
  freeTrial: boolean | null;
  startingPrice: string | null;
  note: string | null;
  plans: PricingPlan[];
  /**
   * Set when prices were copied from the vendor's own pricing page: the ISO
   * date they were checked and the page they came from. A price without both
   * fails lib/data/integrity.test.ts.
   */
  checkedAt?: string;
  sourceUrl?: string;
  /** How the published prices are billed, e.g. "Billed annually". */
  billingNote?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Product {
  slug: string;
  name: string;
  vendorSlug: string;
  tagline: string;
  description: string;
  website: string;
  categorySlugs: string[];
  primaryCategory: string;
  industrySlugs: string[];
  featureSlugs: string[];
  integrationSlugs: string[];
  pricing: Pricing;
  deployment: Deployment[];
  platforms: Platform[];
  companySizes: CompanySize[];
  highlights: string[];
  pros: string[];
  cons: string[];
  faq: FaqItem[];
  /** Always null in the showcase build: no invented ratings. */
  rating: number | null;
  /** Always 0 in the showcase build: no invented reviews. */
  reviewCount: number;
  addedAt: string;
  featured: boolean;
  /** Editor-curated ordering (not derived from traffic or reviews). */
  trendingRank: number | null;
  /** Always false in the showcase build: sample data, not vendor-verified. */
  verified: boolean;
  brandColor: string;
  logo?: VendorLogo;
}

export interface GuideSection {
  heading: string;
  body: string;
}

export interface Category {
  slug: string;
  name: string;
  parentSlug: string | null;
  /** Two paragraphs separated by a blank line ("\n\n"). */
  intro: string;
  buyingGuide: GuideSection[];
  faq: FaqItem[];
  relatedSlugs: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface CategoryNode extends Category {
  children: Category[];
}

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface VendorLogo {
  src: string;
  width: number;
  height: number;
  source: "press-kit" | "licensed-provider";
  retrievedAt: string;
}

export interface Industry {
  slug: string;
  name: string;
  /** Name of a lucide-react icon, e.g. "HeartPulse". */
  icon: string;
  tagline: string;
  /** Two paragraphs separated by a blank line ("\n\n"). */
  intro: string;
  /** Short list of what software in this industry is typically asked to do. */
  commonNeeds: string[];
  /** Industry-specific selection advice. */
  selectionAdvice: GuideSection[];
  recommendedCategorySlugs: string[];
  faq: FaqItem[];
  seoTitle: string;
  seoDescription: string;
  image?: ImageAsset;
}

export interface Vendor {
  slug: string;
  name: string;
  website: string;
  description: string;
  headquarters: string | null;
  logo?: VendorLogo;
}

export interface Feature {
  slug: string;
  name: string;
  /** Grouping label used to organise the taxonomy in filters. */
  group: string;
  description: string;
}

export interface Integration {
  slug: string;
  name: string;
  website: string;
  logo?: VendorLogo;
}

export type ArticleKind = "blog" | "guide" | "best-software" | "research" | "buying-guide";

export type Block =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; title?: string; text: string };

export interface Article {
  kind: ArticleKind;
  slug: string;
  title: string;
  /**
   * Short title for the <title> tag and social cards, set when `title` is
   * longer than 45 characters (the template adds " | Faresolution"; R13).
   * A real short title, never a truncation.
   */
  seoTitle?: string;
  excerpt: string;
  body: Block[];
  authorSlug: string;
  categoryLabel: string;
  publishedAt: string;
  updatedAt: string;
  relatedProductSlugs: string[];
  relatedCategorySlugs: string[];
  featured: boolean;
  cover?: ImageAsset;
}

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar?: ImageAsset;
}

export interface PopularComparison {
  slugs: string[];
}
