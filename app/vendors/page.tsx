import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChartColumn,
  Check,
  Columns3,
  Compass,
  Inbox,
  LayoutList,
  MousePointerClick,
  Eye,
  Layers,
  X,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { VendorNav, VendorProgrammeStatus } from "@/components/vendors/VendorsHeader";
import { PLAN_PRICING_STATUS, VENDOR_PLANS } from "@/lib/data/content/plans";
import { getCategories, getIndustries, getProducts } from "@/lib/data";
import { PRODUCT_TABS } from "@/lib/products/tabs";
import { buildMetadata } from "@/lib/seo";

const title = "For vendors";
const description =
  "How software vendors will work with Faresolution at launch: accurate listings, public review responses, consent-based buyer requests, aggregate insights and clearly labelled sponsored placements.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/vendors" });

interface Benefit {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}

const REVIEW_STEPS = [
  {
    title: "Invite your customers",
    body: "Send customers a review link from your vendor account. Invited reviews will be labelled as invited and checked exactly like any other.",
  },
  {
    title: "Respond in public",
    body: "Post one public response to each review of your product, marked as coming from you, so buyers see both sides.",
  },
  {
    title: "Report what breaks the rules",
    body: "Flag a review you believe breaks the guidelines. A person will read every report, from vendors and readers alike.",
  },
];

const VENDORS_CANNOT = [
  "Edit, hide, reorder or remove reviews",
  "Pay to change a rating or a review's visibility",
  "See a reviewer's verification details",
  "Buy a place in an editors' shortlist",
];

const INSIGHTS: { icon: LucideIcon; label: string; body: string }[] = [
  { icon: Eye, label: "Profile views", body: "How often buyers open your profile and its tabs." },
  { icon: Columns3, label: "Comparison appearances", body: "Comparisons your product is added to, and the products it is compared with." },
  { icon: Layers, label: "Alternatives appearances", body: "How often your product is suggested as an alternative, and to what." },
  { icon: MousePointerClick, label: "Website clicks", body: "Visits from your profile to your own site." },
];

const LEAD_STEPS = [
  { label: "A buyer asks", body: "They will choose “Request demo” on your profile. Nothing will be sent unless they do." },
  { label: "They choose what to share", body: "The details passed on will be shown to them, and only sent once they confirm." },
  { label: "You receive the request", body: "Only the product's vendor will receive it. Requests will never be sold or shared with others." },
];

export default async function VendorsPage() {
  const [products, categories, industries] = await Promise.all([getProducts(), getCategories(), getIndustries()]);
  const example = products.find((p) => p.slug === "hubspot-crm") ?? products[0] ?? null;

  const benefits: Benefit[] = [
    {
      icon: LayoutList,
      title: "A full product profile",
      body: `Every listing has the same structure buyers rely on: ${PRODUCT_TABS.map((t) => t.label.toLowerCase()).join(", ")}.`,
      href: example ? `/products/${example.slug}` : "/software",
      linkLabel: "See an example profile",
    },
    {
      icon: Columns3,
      title: "Side-by-side comparisons",
      body: "Buyers line up two to four products by plans, deployment, platforms and features. Accurate facts are what make your product read well here.",
      href: "/compare",
      linkLabel: "Build a comparison",
    },
    {
      icon: Compass,
      title: "Alternatives pages",
      body: "Each product has an alternatives page that explains why products are similar, so you appear where buyers are reconsidering a competitor.",
      href: "/alternatives",
      linkLabel: "Browse alternatives",
    },
    {
      icon: Inbox,
      title: "Category and industry pages",
      body: `Listings sit in ${categories.length} categories and ${industries.length} industry guides, each with filters for company size, deployment and pricing model.`,
      href: "/categories",
      linkLabel: "Explore categories",
    },
  ];

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="pt-8 pb-12 sm:pt-12 sm:pb-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "For vendors" }]} />
          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
            <div className="min-w-0">
              <p className="type-label">For software vendors</p>
              <h1 className="type-display mt-3 max-w-[16ch] text-navy">Meet buyers while they compare.</h1>
              <p className="mt-5 max-w-xl text-[1.125rem] leading-8 text-pretty text-ink">
                Faresolution is a directory where business buyers shortlist and compare software. At launch, vendors
                will be able to claim their listing, keep its facts right, answer reviews in public and hear from
                buyers who ask to be contacted.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/vendors/claim-listing" size="lg">
                  Prepare a listing claim
                  <ArrowRight aria-hidden="true" strokeWidth={2} />
                </Button>
                <Button href="/vendors/register" variant="secondary" size="lg">
                  Register interest
                </Button>
              </div>
              <p className="type-meta mt-5 max-w-lg">
                The vendor programme opens at launch. Until then, both forms keep what you enter in your browser only.
              </p>
            </div>

            <figure className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface shadow-raised">
              <Image
                src="/images/sections/vendors-hero.webp"
                alt="Architectural illustration of three structured software profile frames side by side."
                width={1600}
                height={1000}
                priority
                sizes="(min-width: 1024px) 42vw, 94vw"
                className="aspect-[16/10] w-full object-cover"
              />
            </figure>
          </div>
          <VendorNav current="/vendors" className="mt-12" />
        </Container>
      </header>

      <section aria-labelledby="vendors-listing-title" className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
            <div className="max-w-2xl">
              <p className="type-label mb-3">Listing</p>
              <h2 id="vendors-listing-title" className="type-h2 text-navy">
                Where your product shows up
              </h2>
              <p className="type-body mt-3 text-subtle">
                Listings today are sample entries, marked as not verified with their vendors. Claiming your listing, once
                claims open, will be how you make sure buyers read the right facts.
              </p>
            </div>
            <figure className="min-w-0 rounded-lg border border-line bg-surface shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                <p className="type-label">Anatomy of a listing</p>
                <Badge>Illustration</Badge>
              </div>
              <div className="p-5">
                <ul className="flex flex-wrap gap-1.5" aria-label="Profile tabs">
                  {PRODUCT_TABS.map((tab, index) => (
                    <li
                      key={tab.label}
                      className={
                        index === 0
                          ? "rounded-sm bg-navy px-2.5 py-1 text-xs font-medium text-white"
                          : "rounded-sm border border-line px-2.5 py-1 text-xs font-medium text-ink"
                      }
                    >
                      {tab.label}
                    </li>
                  ))}
                </ul>
                <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
                  {[
                    ["Facts", "Deployment, platforms, company sizes, integrations"],
                    ["Pricing", "At launch, only what can be checked; today's sample pricing is unchecked"],
                    ["Reviews", "Will be shown once collected and checked; none today"],
                    ["Vendor response", "Your public reply under each review"],
                  ].map(([term, detail]) => (
                    <div key={term} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2.5">
                      <dt className="font-medium text-navy">{term}</dt>
                      <dd className="text-subtle">{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <figcaption className="type-meta border-t border-line px-5 py-3">
                Every product gets this structure whether or not its vendor takes a plan.
              </figcaption>
            </figure>
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {benefits.map(({ icon: Icon, title: heading, body, href, linkLabel }) => (
              <li key={heading} className="flex flex-col bg-surface p-6 sm:p-7">
                <Icon aria-hidden="true" className="size-5 text-blue" strokeWidth={1.75} />
                <h3 className="type-h3 mt-4 text-navy">{heading}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{body}</p>
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center gap-1.5 self-start rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
                >
                  {linkLabel}
                  <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="vendors-reviews-title" className="border-t border-line bg-surface-alt py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <p className="type-label mb-3">Review management (planned)</p>
            <h2 id="vendors-reviews-title" className="type-h2 max-w-[22ch] text-navy">
              Answer reviews in public, never control them
            </h2>
            <p className="type-body mt-4 max-w-xl text-subtle">
              Review collection isn&rsquo;t open yet, so no product has reviews today. When it opens, a vendor with a
              confirmed claim will have three tools, and the same limits as everyone else.
            </p>
            <div className="mt-8 rounded-lg border border-line bg-surface p-5 shadow-card">
              <p className="text-sm font-semibold text-navy">What no vendor will be able to do</p>
              <ul className="mt-3 space-y-2">
                {VENDORS_CANNOT.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-ink">
                    <X aria-hidden="true" className="mt-1 size-4 shrink-0 text-danger" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <ol className="border-t border-line">
              {REVIEW_STEPS.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-line py-6">
                  <span aria-hidden="true" className="font-serif text-[1.75rem] leading-none text-violet-ink tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="type-h3 text-navy">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-subtle">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link
                href="/review-guidelines"
                className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
              >
                Review guidelines
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </Link>
              <Link href="/review-verification" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
                How reviewers will be verified
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="vendors-leads-title" className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="type-label mb-3">Buyer requests (planned)</p>
              <h2 id="vendors-leads-title" className="type-h2 text-navy">
                Leads that asked to hear from you
              </h2>
              <p className="type-body mt-4 text-subtle">
                No contact lists, no tracking pixels, no auto-enrolment. A request reaches you only when a buyer
                chooses to send it.
              </p>
            </div>
            <div>
              <ol className="grid gap-4 md:grid-cols-3">
                {LEAD_STEPS.map((step, index) => (
                  <li key={step.label} className="rounded-lg border border-line bg-surface p-5 shadow-card">
                    <p className="type-label">Step {index + 1}</p>
                    <h3 className="type-h3 mt-2 text-navy">{step.label}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-subtle">{step.body}</p>
                  </li>
                ))}
              </ol>
              <p className="type-meta mt-5 max-w-2xl">
                Today the &ldquo;Request demo&rdquo; button on a profile opens our contact form, which keeps the message
                in the buyer&rsquo;s browser and tells them so. Nothing is forwarded to vendors yet.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="vendors-insights-title" className="border-t border-line py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-20">
          <div className="lg:order-2">
            <p className="type-label mb-3">Insights (planned)</p>
            <h2 id="vendors-insights-title" className="type-h2 text-navy">
              See how buyers find you
            </h2>
            <p className="type-body mt-4 max-w-xl text-subtle">
              Insights will be aggregate counts for your own listings, never a feed of who looked. There are no figures
              to show yet, so this page shows none.
            </p>
            <Link
              href="/vendors/pricing"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
            >
              Which plans include insights
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
            </Link>
          </div>
          <div className="rounded-lg border border-line bg-surface shadow-card lg:order-1">
            <div className="flex items-center gap-2 border-b border-line px-5 py-3">
              <ChartColumn aria-hidden="true" className="size-4 text-blue" strokeWidth={1.75} />
              <p className="text-sm font-semibold text-navy">What the insights view will count</p>
            </div>
            <ul className="divide-y divide-line">
              {INSIGHTS.map(({ icon: Icon, label, body }) => (
                <li key={label} className="flex items-start gap-3 px-5 py-4">
                  <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{label}</p>
                    <p className="type-meta">{body}</p>
                  </div>
                  <span className="type-meta shrink-0">No data yet</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section aria-labelledby="vendors-ads-title" className="on-dark bg-navy py-16 text-white sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.08em] text-white/70 uppercase">Advertising (planned)</p>
            <h2 id="vendors-ads-title" className="type-h2 text-white">
              Paid placements, always labelled
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
              Sponsored placements will sit in their own clearly marked slots on category and comparison pages. They
              will never change organic order, ratings, reviews or the editors&rsquo; shortlists, and a buyer will
              always be able to tell the two apart.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                "Every paid slot will carry a visible “Sponsored” label",
                "Organic results will keep the order of the buyer's own filters and sort",
                "Sponsorship will never place a product in editorial picks or buying guides",
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2.5 text-sm leading-6 text-white/85">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-blue-light" strokeWidth={2} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <figure className="rounded-lg border border-white/12 bg-white/5 p-5">
            <figcaption className="text-xs font-semibold tracking-[0.08em] text-white/70 uppercase">
              How the two will look apart
            </figcaption>
            <div className="mt-4 rounded-md bg-surface p-4 text-ink">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-navy">Sponsored slot</p>
                <Badge tone="sponsored">Sponsored</Badge>
              </div>
              <p className="type-meta mt-1">Paid for by the vendor. Will sit above or beside results, never inside them.</p>
            </div>
            <div className="mt-3 rounded-md bg-surface p-4 text-ink">
              <p className="text-sm font-semibold text-navy">Organic results</p>
              <p className="type-meta mt-1">Ordered only by the buyer&rsquo;s filters and sort. No plan will change this.</p>
              <div aria-hidden="true" className="mt-3 space-y-2">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="h-2.5 rounded-xs bg-line" style={{ width: `${92 - row * 14}%` }} />
                ))}
              </div>
            </div>
          </figure>
        </Container>
      </section>

      <section aria-labelledby="vendors-plans-title" className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
            <div className="max-w-2xl">
              <p className="type-label mb-3">Plans</p>
              <h2 id="vendors-plans-title" className="type-h2 text-navy">
                {VENDOR_PLANS.length} plans, one set of rules
              </h2>
              <p className="type-body mt-3 text-subtle">
                {PLAN_PRICING_STATUS}. Every product stays listed whether or not its vendor takes a plan, and no plan
                changes how reviews are treated.
              </p>
            </div>
            <Button href="/vendors/pricing" variant="secondary">
              Compare plans
              <ArrowRight aria-hidden="true" strokeWidth={2} />
            </Button>
          </div>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {VENDOR_PLANS.map((plan) => (
              <li key={plan.id} className="flex flex-col rounded-lg border border-line bg-surface p-6 shadow-card">
                <h3 className="font-serif text-[1.5rem] leading-tight font-[460] text-navy">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{plan.audience}</p>
                <p className="type-meta mt-auto border-t border-line pt-4">{PLAN_PRICING_STATUS}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="vendors-start-title" className="border-t border-line bg-surface-alt py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <p className="type-label mb-3">Get ready for launch</p>
            <h2 id="vendors-start-title" className="type-h2 text-navy">
              Is your product already listed?
            </h2>
            <p className="type-body mt-3 max-w-xl text-subtle">
              Find it, prepare a claim request and read what to have ready. When claims open you will be able to
              confirm you represent the product and correct its facts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/vendors/claim-listing">Prepare a listing claim</Button>
              <Button href="/vendors/resources" variant="secondary">
                Vendor resources
              </Button>
            </div>
          </div>
          <VendorProgrammeStatus />
        </Container>
      </section>
    </>
  );
}
