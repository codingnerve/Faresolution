import type { Metadata } from "next";
import { AlternativesFinder, type FinderGroup } from "@/components/alternatives/AlternativesFinder";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getCategories, getProducts, getVendors } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

const title = "Software alternatives";
const description =
  "Find products similar to the software you already know, matched on categories, features, pricing model, industries and deployment. Listed by similarity, not by ratings or popularity.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/alternatives" });

const FACTORS: { term: string; detail: string }[] = [
  {
    term: "Categories",
    detail: "The same primary category counts most. Other shared categories add to the match.",
  },
  { term: "Features", detail: "How many of the listed features two products have in common." },
  { term: "Pricing model", detail: "Both freemium, both subscription and so on, and whether both have a free plan." },
  { term: "Industries", detail: "Industries both products are listed for." },
  { term: "Deployment", detail: "Cloud, on-premise or hybrid options they share." },
];

export default async function AlternativesIndexPage() {
  const [products, categories, vendors] = await Promise.all([getProducts(), getCategories(), getVendors()]);
  const vendorName = new Map(vendors.map((v) => [v.slug, v.name]));

  const groups: FinderGroup[] = categories
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      products: products
        .filter((p) => p.primaryCategory === category.slug)
        .sort((a, b) => a.name.localeCompare(b.name, "en") || a.slug.localeCompare(b.slug))
        .map((p) => ({
          slug: p.slug,
          name: p.name,
          vendorName: vendorName.get(p.vendorSlug) ?? null,
          brandColor: p.brandColor,
        })),
    }))
    .filter((group) => group.products.length > 0);

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Alternatives" }]} />
          <p className="type-label mt-6">Alternatives</p>
          <h1 className="type-h1 mt-2 max-w-3xl text-navy">Software alternatives</h1>
          <p className="type-body mt-3 max-w-2xl text-subtle">
            Choose a product you already know and see similar products in the catalogue. Each alternative comes with a
            plain-language reason for the match and a link to compare the two side by side.
          </p>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <section aria-labelledby="how-title" className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] lg:gap-12">
          <div>
            <p className="type-label mb-3">Method</p>
            <h2 id="how-title" className="type-h2 text-navy">
              How alternatives are chosen
            </h2>
            <p className="type-body mt-3 text-subtle">
              Matches are scored from the facts in each listing. Anything we do not know is left out of the score rather
              than counted against a product. A product is listed only if it shares a category with the one you chose, or
              several distinctive features that few other products have. We do not use ratings or popularity: no reviews
              have been collected yet.
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {FACTORS.map((factor) => (
              <div key={factor.term} className="border-t border-line pt-3">
                <dt className="text-sm font-semibold text-navy">{factor.term}</dt>
                <dd className="type-body mt-1 text-subtle">{factor.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="find-title" className="mt-14 border-t border-line pt-10 sm:mt-16">
          <h2 id="find-title" className="type-h2 mb-2 text-navy">
            Find alternatives to a product
          </h2>
          <p className="type-body mb-6 max-w-2xl text-subtle">Products are grouped by their primary category.</p>
          <DemoDataNotice className="mb-8" />
          <AlternativesFinder groups={groups} />
        </section>
      </Container>
    </>
  );
}
