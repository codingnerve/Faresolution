import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { softwareSearchHref } from "@/components/layout/navigation";
import { Container } from "@/components/ui/Container";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { getProducts, getVendors } from "@/lib/data";

const MAX_VENDORS = 12;

/**
 * Vendors behind the editor's shortlist, as a typographic strip. Only vendors
 * with at least one listed product appear; each links to its products.
 */
export async function VendorStrip() {
  const [products, vendors] = await Promise.all([getProducts(), getVendors()]);
  const productCount = new Map<string, number>();
  for (const p of products) productCount.set(p.vendorSlug, (productCount.get(p.vendorSlug) ?? 0) + 1);

  const featuredVendorSlugs = new Set(products.filter((p) => p.featured).map((p) => p.vendorSlug));
  const strip = vendors
    .filter((v) => featuredVendorSlugs.has(v.slug) && (productCount.get(v.slug) ?? 0) > 0)
    .slice(0, MAX_VENDORS);
  if (strip.length === 0) return null;

  return (
    <section aria-labelledby="home-vendors-title" className="border-y border-line bg-surface">
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,15rem)] lg:items-center lg:gap-12">
        <div>
          <h2 id="home-vendors-title" className="type-label">
            Vendors in the directory
          </h2>
          <p className="mt-2 text-[0.8125rem] leading-5 text-subtle">
            Profiles are compiled from public information and are not yet
            vendor-verified.
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-7 gap-y-4">
          {strip.map((vendor) => {
            const n = productCount.get(vendor.slug) ?? 0;
            return (
              <li key={vendor.slug}>
                <Link
                  href={softwareSearchHref(vendor.name)}
                  className="group inline-flex items-center gap-2.5 rounded-xs"
                  aria-label={`${vendor.name}, ${n} ${n === 1 ? "product" : "products"}`}
                >
                  <ProductLogo name={vendor.name} color="#17243A" logo={vendor.logo} size={28} />
                  <span className="text-[1rem] font-semibold tracking-[-0.02em] text-ink/85 transition-colors group-hover:text-navy">
                    {vendor.name}
                  </span>
                  <span aria-hidden="true" className="text-xs text-subtle tabular-nums">
                    {n}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <p className="text-sm font-semibold text-navy">Is your product listed?</p>
          <Link
            href="/vendors/claim-listing"
            className="mt-1 inline-flex items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
          >
            Claim your listing
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
