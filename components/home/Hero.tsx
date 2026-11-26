import Link from "next/link";
import { compareHref, productHref, softwareSearchHref } from "@/components/layout/navigation";
import { SearchBox } from "@/components/layout/SearchBox";
import { Container } from "@/components/ui/Container";
import {
  getCategories,
  getPopularComparisons,
  getProducts,
  getVendors,
  resolveLogo,
  type Deployment,
  type Platform,
  type Product,
} from "@/lib/data";
import { suggestedSearches } from "@/lib/search";
import { SITE_TAGLINE } from "@/lib/site";
import { HeroComparePanel, type PanelComparison } from "./HeroComparePanel";
import { HeroStage } from "./HeroStage";

/** Head-to-heads shown in the hero panel, in tab order (must be popular comparisons). */
const PANEL_COMPARISONS = [
  ["hubspot-crm", "zoho-crm"],
  ["asana", "monday-com"],
  ["quickbooks-online", "xero"],
] as const;

const PLATFORM_LABELS: Record<Platform, string> = {
  web: "Web",
  ios: "iOS",
  android: "Android",
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
  api: "API",
};

const DEPLOYMENT_LABELS: Record<Deployment, string> = {
  cloud: "Cloud",
  "on-premise": "On-premise",
  hybrid: "Hybrid",
};

function yesNo(value: boolean | null): string {
  if (value === null) return "Not verified";
  return value ? "Yes" : "No";
}

function list(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "Not verified";
}

const shortCategory = (name: string) => name.replace(/\s+Software$/i, "");

async function buildPanel(): Promise<PanelComparison[]> {
  const [products, categories, vendors, popular] = await Promise.all([
    getProducts(),
    getCategories(),
    getVendors(),
    getPopularComparisons(),
  ]);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const vendorBySlug = new Map(vendors.map((v) => [v.slug, v]));
  const vendorName = new Map(vendors.map((v) => [v.slug, v.name]));
  const popularKeys = new Set(popular.map((c) => c.slugs.join("|")));

  const comparisons: PanelComparison[] = [];
  for (const pair of PANEL_COMPARISONS) {
    const a = productBySlug.get(pair[0]);
    const b = productBySlug.get(pair[1]);
    if (!a || !b || !popularKeys.has(pair.join("|"))) continue;
    const both = <T,>(fn: (p: Product) => T): [T, T] => [fn(a), fn(b)];
    comparisons.push({
      key: pair.join("-vs-"),
      label: shortCategory(categoryName.get(a.primaryCategory) ?? a.primaryCategory),
      href: compareHref([...pair]),
      products: both((p) => {
        const vendor = vendorBySlug.get(p.vendorSlug);
        return {
          name: p.name,
          vendorName: vendor?.name ?? null,
          brandColor: p.brandColor,
          logo: resolveLogo(p, vendor),
          href: productHref(p.slug),
        };
      }),
      rows: [
        { label: "Vendor", values: both((p) => vendorName.get(p.vendorSlug) ?? "Not verified") },
        { label: "Free plan", values: both((p) => yesNo(p.pricing.freePlan)) },
        { label: "Free trial", values: both((p) => yesNo(p.pricing.freeTrial)) },
        { label: "Deployment", values: both((p) => list(p.deployment.map((d) => DEPLOYMENT_LABELS[d]))) },
        { label: "Platforms", values: both((p) => list(p.platforms.map((x) => PLATFORM_LABELS[x]))) },
        { label: "Reviews", values: both(() => "None yet") },
      ],
    });
  }
  return comparisons;
}

const chipClass =
  "inline-flex h-8 items-center rounded-md border border-line bg-surface px-3 text-[0.8125rem] font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-alt hover:text-navy";

export async function Hero() {
  const [products, categories, vendors, panel] = await Promise.all([
    getProducts(),
    getCategories(),
    getVendors(),
    buildPanel(),
  ]);
  const listedVendors = new Set(products.map((p) => p.vendorSlug));
  const vendorCount = vendors.filter((v) => listedVendors.has(v.slug)).length;

  const stats = [
    { value: products.length, label: "products profiled" },
    { value: categories.length, label: "categories" },
    { value: vendorCount, label: "vendors" },
  ];

  return (
    <section aria-labelledby="home-hero-title" className="relative isolate overflow-x-clip border-b border-line">
      {/* Only the grid is clipped, so the search suggestions can overflow the hero. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="depth-grid" />
      </div>
      <Container className="relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14 lg:py-20 xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-20">
        <div className="min-w-0">
          <p className="rise-on-load flex items-center gap-3 text-[0.8125rem] font-semibold tracking-[0.01em] text-blue-ink">
            <span aria-hidden="true" className="h-px w-8 bg-blue" />
            {SITE_TAGLINE}
          </p>
          <h1 id="home-hero-title" className="rise-on-load type-display mt-5 max-w-[15ch] text-navy [--rise-delay:80ms]">
            Find the software that moves your business{" "}
            <em className="text-violet-ink italic">forward.</em>
          </h1>
          <p className="rise-on-load type-body mt-6 max-w-[36rem] [--rise-delay:160ms] text-[1.0625rem] leading-7 text-subtle">
            Browse business software by category, compare products side by
            side on the facts that matter, and leave with a shortlist your team
            can agree on.
          </p>

          <SearchBox
            variant="inline"
            size="lg"
            label="Search software, categories or brands"
            placeholder="Search software or categories"
            className="rise-on-load relative z-20 mt-8 max-w-[38rem] [--rise-delay:240ms]"
          />

          <div className="rise-on-load mt-5 flex max-w-[38rem] flex-wrap items-center gap-2 [--rise-delay:320ms]">
            <span className="mr-1 text-[0.8125rem] text-subtle">Try:</span>
            {suggestedSearches.slice(0, 5).map((term) => (
              <Link key={term} href={softwareSearchHref(term)} className={chipClass}>
                {term}
              </Link>
            ))}
          </div>

          <dl className="rise-on-load mt-10 grid [--rise-delay:400ms] grid-cols-3 gap-4 border-t border-line pt-6 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-2">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-serif text-[1.75rem] leading-none text-navy tabular-nums">{stat.value}</dd>
                <dd aria-hidden="true" className="text-[0.8125rem] text-subtle">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {panel.length > 0 && (
          <div className="min-w-0">
            <HeroStage>
              <HeroComparePanel comparisons={panel} />
            </HeroStage>
          </div>
        )}
      </Container>
    </section>
  );
}
