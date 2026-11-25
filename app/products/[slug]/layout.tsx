import { notFound } from "next/navigation";
import { categoryHref } from "@/components/layout/navigation";
import { ProductFacts } from "@/components/product/ProductFacts";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ProductBreadcrumbs, ProductTabs } from "@/components/product/ProductTabs";
import type { BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { getProductProfile, getProductSlugs } from "@/lib/products/profile";
import { productTabHref } from "@/lib/products/tabs";

// Every product (and so every tab page below) is generated at build time.
// Unknown slugs get a real 404 from proxy.ts (lib/route-guards.ts, R12);
// `notFound()` below is defence in depth. The tab bar and breadcrumbs read the
// active tab with useSelectedLayoutSegment, which resolves at build time for
// these params, so they need no Suspense boundary.
export async function generateStaticParams() {
  return getProductSlugs();
}

export default async function ProductLayout({ children, params }: LayoutProps<"/products/[slug]">) {
  const { slug } = await params;
  const profile = await getProductProfile(slug);
  if (!profile) notFound();

  const { product, vendor, primaryCategory, categories, industries } = profile;
  const crumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Software", href: "/software" },
    ...(primaryCategory ? [{ label: primaryCategory.name, href: categoryHref(primaryCategory.slug) }] : []),
    { label: product.name, href: productTabHref(slug, null) },
  ];

  return (
    <>
      <div className="border-b border-line bg-surface-alt">
        <Container className="pt-6 pb-8 sm:pt-8 sm:pb-10">
          <ProductBreadcrumbs slug={slug} items={crumbs} />
          <div className="mt-6 sm:mt-8">
            <ProductHeader product={product} vendor={vendor} primaryCategory={primaryCategory} />
          </div>
        </Container>
      </div>

      <div className="sticky top-16 z-30 border-b border-line bg-surface">
        <Container>
          <ProductTabs slug={slug} name={product.name} className="border-b-0" />
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">{children}</div>
          <aside aria-label={`${product.name} at a glance`} className="space-y-4 lg:self-start">
            <ProductFacts product={product} categories={categories} industries={industries} />
            <DemoDataNotice />
          </aside>
        </div>
      </Container>
    </>
  );
}
