import { ProductTile } from "@/components/product/ProductTile";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getProducts, getVendors } from "@/lib/data";

const SHORTLIST_SIZE = 6;

/** Featured products as tiles. Editorial picks in data order, not a ranking. */
export async function EditorsShortlist() {
  const [products, vendors] = await Promise.all([getProducts(), getVendors()]);
  const vendorName = new Map(vendors.map((v) => [v.slug, v.name]));
  const shortlist = products.filter((p) => p.featured).slice(0, SHORTLIST_SIZE);
  if (shortlist.length === 0) return null;

  return (
    <section aria-labelledby="home-shortlist-title" className="border-y border-line bg-surface-alt py-16 sm:py-20 lg:py-24">
      <Container>
        <SectionHeader
          id="home-shortlist-title"
          eyebrow="Editor's shortlist"
          title="Established tools worth a first look"
          description="A small editorial selection of widely used products, chosen as sensible starting points in their categories. The order is not a ranking."
          action={
            <Button href="/software" variant="secondary">
              Browse all software
            </Button>
          }
        />

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
          {shortlist.map((product) => (
            <li key={product.slug}>
              <ProductTile product={product} vendorName={vendorName.get(product.vendorSlug) ?? null} />
            </li>
          ))}
        </ul>

        <DemoDataNotice className="mt-8" />
      </Container>
    </section>
  );
}
