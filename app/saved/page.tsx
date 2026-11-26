import type { Metadata } from "next";
import { SavedItems, type SavedProductCard } from "@/components/saved/SavedItems";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { getProducts, getVendors } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

const title = "Saved items";
const description =
  "Products you saved and the products you picked to compare, kept in this browser only. Nothing here is sent to Faresolution.";

// Personal to each browser: noindex and out of the sitemap (crawlable, so the noindex is seen).
export const metadata: Metadata = buildMetadata({ title, description, path: "/saved", noindex: true });

export default async function SavedPage() {
  const [products, vendors] = await Promise.all([getProducts(), getVendors()]);
  const vendorName = new Map(vendors.map((v) => [v.slug, v.name]));
  // The whole catalogue as card data (small: no descriptions, plans or FAQs),
  // so the client can show whatever this browser has saved.
  const cards: SavedProductCard[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    vendorName: vendorName.get(p.vendorSlug) ?? null,
    tagline: p.tagline,
    brandColor: p.brandColor,
    rating: p.rating,
    reviewCount: p.reviewCount,
    highlights: p.highlights.slice(0, 3),
    pricing: { freePlan: p.pricing.freePlan, freeTrial: p.pricing.freeTrial },
  }));

  return (
    <>
      <header className="border-b border-line bg-surface-alt">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Saved items" }]} />
          <p className="type-label mt-6">Your shortlist</p>
          <h1 className="type-h1 mt-2 max-w-3xl text-navy">Saved items</h1>
          <p className="type-body mt-3 max-w-2xl text-subtle">
            The products you saved and the ones you picked to compare. They are kept in this browser only: there are no
            accounts yet, nothing is sent to us, and clearing this site&rsquo;s data or switching browsers starts an empty
            list.
          </p>
        </Container>
      </header>

      <Container className="py-10 sm:py-14">
        <SavedItems products={cards} />
      </Container>
    </>
  );
}
