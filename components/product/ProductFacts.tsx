import Link from "next/link";
import type { ReactNode } from "react";
import { categoryHref, industryHref } from "@/components/layout/navigation";
import type { Category, Industry, Product } from "@/lib/data";
import { companySizeLabel, deploymentLabel, platformLabel } from "@/lib/directory/labels";
import { cn, formatPricing } from "@/lib/utils";

const NOT_VERIFIED = <span className="text-subtle">Not verified</span>;

function list(values: readonly string[]): ReactNode {
  return values.length > 0 ? values.join(", ") : NOT_VERIFIED;
}

function links(items: readonly { slug: string; name: string }[], href: (slug: string) => string): ReactNode {
  if (items.length === 0) return NOT_VERIFIED;
  return (
    <ul className="flex flex-wrap gap-x-1 gap-y-0.5">
      {items.map((item, index) => (
        <li key={item.slug}>
          <Link href={href(item.slug)} className="rounded-xs text-blue-ink hover:text-navy">
            {item.name}
          </Link>
          {index < items.length - 1 && <span aria-hidden="true">,</span>}
        </li>
      ))}
    </ul>
  );
}

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

type ProductFactsProps = {
  product: Product;
  categories: Category[];
  industries: Industry[];
  className?: string;
};

/**
 * Key facts from the listing data. Anything the data does not state reads
 * "Not verified" rather than a guess.
 */
export function ProductFacts({ product, categories, industries, className }: ProductFactsProps) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Pricing", value: formatPricing(product) },
    { label: "Deployment", value: list(product.deployment.map((d) => deploymentLabel[d])) },
    { label: "Platforms", value: list(product.platforms.map((p) => platformLabel[p])) },
    { label: "Company size", value: list(product.companySizes.map((s) => companySizeLabel[s])) },
    { label: "Industries", value: links(industries, industryHref) },
    { label: "Categories", value: links(categories, categoryHref) },
    { label: "Website", value: hostname(product.website) ?? NOT_VERIFIED },
  ];

  return (
    <section aria-labelledby="product-facts-title" className={cn("rounded-lg border border-line bg-surface", className)}>
      <h2 id="product-facts-title" className="border-b border-line px-5 py-3.5 text-[0.9375rem] font-semibold text-navy">
        Product facts
      </h2>
      <dl className="divide-y divide-line px-5">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 py-3">
            <dt className="type-label">{row.label}</dt>
            <dd className="text-sm leading-6 text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
