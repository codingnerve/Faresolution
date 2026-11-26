import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getArticle, getCategories, getProducts } from "@/lib/data";
import { articleHref } from "@/lib/editorial";
import { SITE_TAGLINE } from "@/lib/site";
import { SITE_NAME } from "@/lib/utils";

const title = "About Faresolution";
const description =
  "Why Faresolution exists, how the software directory works, how products are listed, how editorial independence is kept and what is still demonstration data.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/about", title, description },
};

const HOW_IT_WORKS = [
  {
    word: "Find",
    body: "Browse categories and industries, or search by product, vendor or need, then filter by company size, deployment, pricing model and features.",
    href: "/software",
    link: "Browse software",
  },
  {
    word: "Compare",
    body: "Line up two to four products side by side, or start from a product you know and read why its alternatives are similar.",
    href: "/compare",
    link: "Build a comparison",
  },
  {
    word: "Choose better",
    body: "Buying guides explain what to settle before you sign and what to ask the vendor, category by category.",
    href: "/software-buying-guides",
    link: "Read a buying guide",
  },
];

const PRINCIPLES = [
  {
    title: "Facts we can stand behind",
    body: "A listing records only what we are confident of. Anything else says “Not verified” rather than a guess, and prices appear only when they can be checked.",
  },
  {
    title: "No borrowed or invented ratings",
    body: "Ratings will be calculated only from reviews collected and checked here. Until then every product reads “No reviews yet”, and none shows a score.",
  },
  {
    title: "Editorial and paid kept apart",
    body: "Shortlists and guides are written by the editors, and say what they are based on. When sponsored placements exist, they will be labelled and kept out of organic results and editorial picks.",
  },
  {
    title: "Vendors can correct, not control",
    body: "Once the vendor programme opens, vendors will be able to correct their listing's facts and respond to reviews. They will never be able to edit, hide or remove a review.",
  },
];

export default async function AboutPage() {
  const [products, categories, method] = await Promise.all([
    getProducts(),
    getCategories(),
    getArticle("research", "how-faresolution-handles-product-facts-and-reviews"),
  ]);

  return (
    <>
      <CompanyHeader
        eyebrow="About"
        title="About Faresolution"
        intro={
          <p>
            An independent directory for finding, comparing and shortlisting business software. {SITE_TAGLINE}
          </p>
        }
      />

      <section aria-labelledby="about-mission-title" className="py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="type-label mb-3">Mission</p>
            <h2 id="about-mission-title" className="type-h2 text-navy">
              Make software buying less of a guess
            </h2>
          </div>
          <div className="max-w-reading space-y-4">
            <p className="font-serif text-[1.375rem] leading-[1.45] text-navy">
              Most teams choose software from a handful of vendor websites, a few opinions and a trial that ends before
              the hard questions come up. We want to give them a clearer starting point.
            </p>
            <p className="type-body text-ink">
              Faresolution brings the facts buyers need into one consistent shape: what a product does, who it suits, how
              it is deployed, what it connects to and what it is likely to cost. Comparisons, alternatives and buying
              guides are built on those facts, so a shortlist can be argued for rather than assumed.
            </p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-how-title" className="border-t border-line bg-surface-alt py-14 sm:py-20">
        <Container>
          <p className="type-label mb-3">How the directory works</p>
          <h2 id="about-how-title" className="type-h2 text-navy">
            Three steps, each a real page
          </h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.word} className="flex flex-col bg-surface p-6 sm:p-7">
                <span className="type-label">Step {index + 1}</span>
                <h3 className="mt-2 font-serif text-[1.75rem] leading-tight font-[440] text-navy">{step.word}</h3>
                <p className="mt-2 text-sm leading-6 text-subtle">{step.body}</p>
                <Link
                  href={step.href}
                  className="mt-5 inline-flex items-center gap-1.5 self-start rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
                >
                  {step.link}
                  <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="about-principles-title" className="py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="type-label mb-3">Editorial independence</p>
            <h2 id="about-principles-title" className="type-h2 text-navy">
              How we keep the directory honest
            </h2>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-8">
                <dt className="type-h3 text-navy">{principle.title}</dt>
                <dd className="type-body text-subtle">{principle.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section aria-labelledby="about-listing-title" className="border-t border-line py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="type-label mb-3">Listings</p>
            <h2 id="about-listing-title" className="type-h2 text-navy">
              How products are listed
            </h2>
          </div>
          <div className="max-w-reading space-y-4">
            <p className="type-body text-ink">
              Products are chosen by the editors to cover each category, from widely used tools to smaller specialists.
              No vendor has paid for a listing, and taking a vendor plan will not be a condition of staying listed.
            </p>
            <p className="type-body text-ink">
              Each listing is drawn from general, publicly known information about the product and follows the same
              structure: overview, features, pricing, integrations, alternatives, screenshots and questions. Facts we
              are not confident of are left blank and marked &ldquo;Not verified&rdquo;, and no listing has yet been
              checked against current vendor documentation.
            </p>
            <p className="type-body text-ink">
              Vendors will be able to claim their listing at launch and send corrections, which will be checked before
              they appear.{" "}
              <Link href="/vendors" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
                Read about the vendor programme
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-demo-title" className="border-t border-line bg-surface-alt py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="type-label mb-3">Status</p>
            <h2 id="about-demo-title" className="type-h2 text-navy">
              What is still demonstration data
            </h2>
          </div>
          <div className="max-w-reading space-y-5">
            <p className="type-body text-ink">
              This is a preview of Faresolution before launch. The {products.length} product listings across{" "}
              {categories.length} categories are sample entries that have not been verified with their vendors. No
              reviews have been collected, so no product has a rating. There are no accounts, and the forms on the site
              keep what you enter only in your browser.
            </p>
            <DemoDataNotice />
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {method && (
                <li>
                  <Link
                    href={articleHref(method.kind, method.slug)}
                    className="inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
                  >
                    How we handle product facts
                    <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
                  </Link>
                </li>
              )}
              <li>
                <Link href="/review-guidelines" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
                  Review guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
                  Privacy notice
                </Link>
              </li>
              <li>
                <Link href="/contact" className="rounded-xs text-sm font-medium text-ink hover:text-navy">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
