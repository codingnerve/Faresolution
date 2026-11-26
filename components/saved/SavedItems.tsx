"use client";

import { ArrowRight, Bookmark, Columns3, X } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { productHref } from "@/components/layout/navigation";
import type { ProductCardData } from "@/components/product/card-parts";
import { ProductRow } from "@/components/product/ProductRow";
import { SAVED_PRODUCTS_KEY } from "@/components/product/SaveButton";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LogoMark } from "@/components/ui/LogoMark";
import { compareHref, MAX_COMPARE, MIN_COMPARE } from "@/lib/compare/slug";
import { useCompare } from "@/lib/compare/useCompare";
import { useMounted } from "@/lib/hooks/useMounted";
import { useStoredList } from "@/lib/storage";

export type SavedProductCard = ProductCardData & { vendorName: string | null };

/**
 * The visitor's saved products and compare selection, both read from this
 * browser's storage. Renders a neutral placeholder on the server and during
 * hydration (storage is never read there), then the stored lists, so server
 * and first client render match. Stored slugs that no longer exist are skipped.
 */
export function SavedItems({ products }: { products: SavedProductCard[] }) {
  const mounted = useMounted();
  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  return (
    <div className="space-y-14 sm:space-y-16">
      <SavedList mounted={mounted} bySlug={bySlug} />
      <CompareSelection mounted={mounted} bySlug={bySlug} />
    </div>
  );
}

interface SectionProps {
  mounted: boolean;
  bySlug: ReadonlyMap<string, SavedProductCard>;
}

function Loading() {
  return <p className="type-body text-subtle">Checking this browser&rsquo;s saved items&hellip;</p>;
}

function SavedList({ mounted, bySlug }: SectionProps) {
  const [stored, saved] = useStoredList(SAVED_PRODUCTS_KEY);
  const items = stored.flatMap((slug) => bySlug.get(slug) ?? []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const hintId = useId();
  const count = items.length;
  const canCompare = count >= MIN_COMPARE && count <= MAX_COMPARE;

  const hint =
    count < MIN_COMPARE
      ? `Save at least ${MIN_COMPARE} products to compare them here.`
      : count > MAX_COMPARE
        ? `You can compare up to ${MAX_COMPARE} products at once. Remove some, or pick ${MAX_COMPARE} with the Compare buttons below.`
        : null;

  return (
    <section aria-labelledby="saved-products-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="saved-products-heading" ref={headingRef} tabIndex={-1} className="type-h2 text-navy focus:outline-none">
          Saved products
        </h2>
        {mounted && count > 0 && <p className="type-meta tabular-nums">{count} saved</p>}
      </div>
      <span role="status" className="sr-only">
        {announcement}
      </span>

      <div className="mt-6">
        {!mounted ? (
          <Loading />
        ) : count === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Nothing saved in this browser yet"
            description="Use the Save button on any product page to keep it here while you shortlist. Saved products stay in this browser only."
            action={<Button href="/software">Browse software</Button>}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-line bg-surface-alt px-4 py-3">
              {canCompare ? (
                <Button href={compareHref(items.map((p) => p.slug))} size="sm">
                  Compare these {count}
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                // aria-disabled (not disabled) keeps it focusable so the reason is
                // read; with no onClick, activating it does nothing.
                <Button size="sm" aria-disabled="true" aria-describedby={hintId}>
                  Compare these
                </Button>
              )}
              <p id={hintId} className="type-meta">
                {hint ?? "Opens a side-by-side comparison of your saved products."}
              </p>
            </div>

            <ul className="mt-6 space-y-4">
              {items.map((product) => (
                <li key={product.slug}>
                  <ProductRow
                    product={product}
                    vendorName={product.vendorName}
                    actions={
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          saved.remove(product.slug);
                          setAnnouncement(`${product.name} removed from saved products`);
                          headingRef.current?.focus();
                        }}
                      >
                        <X aria-hidden="true" />
                        Remove<span className="sr-only"> {product.name} from saved products</span>
                      </Button>
                    }
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

function CompareSelection({ mounted, bySlug }: SectionProps) {
  const { slugs, remove, clear } = useCompare();
  const items = slugs.flatMap((slug) => bySlug.get(slug) ?? []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const count = items.length;

  return (
    <section aria-labelledby="saved-compare-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="saved-compare-heading" ref={headingRef} tabIndex={-1} className="type-h2 text-navy focus:outline-none">
          Your comparison
        </h2>
        {mounted && count > 0 && (
          <p className="type-meta tabular-nums">
            {count} of {MAX_COMPARE} selected
          </p>
        )}
      </div>
      <span role="status" className="sr-only">
        {announcement}
      </span>

      <div className="mt-6">
        {!mounted ? (
          <Loading />
        ) : count === 0 ? (
          <EmptyState
            icon={Columns3}
            title="No products picked to compare"
            description={`Add two to ${MAX_COMPARE} products with the Compare button on any listing or product page, or pick them on the compare page.`}
            action={
              <Button href="/compare" variant="secondary">
                Go to compare
              </Button>
            }
          />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((product) => (
                <li
                  key={product.slug}
                  className="flex items-center gap-3 rounded-md border border-line bg-surface-alt px-3.5 py-3"
                >
                  <LogoMark name={product.name} color={product.brandColor} size={32} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={productHref(product.slug)}
                      className="block truncate rounded-xs text-[0.9375rem] font-semibold text-navy hover:text-blue-ink"
                    >
                      {product.name}
                    </Link>
                    {product.vendorName && <p className="type-meta truncate">by {product.vendorName}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      remove(product.slug);
                      setAnnouncement(`${product.name} removed from compare`);
                      headingRef.current?.focus();
                    }}
                    aria-label={`Remove ${product.name} from compare`}
                    title={`Remove ${product.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-md text-subtle hover:bg-surface hover:text-navy"
                  >
                    <X aria-hidden="true" className="size-4" strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {count >= MIN_COMPARE ? (
                <Button href={compareHref(items.map((p) => p.slug))}>
                  Open the comparison
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                <p className="type-meta">Add at least one more product to open a comparison.</p>
              )}
              <Button href="/compare" variant="secondary">
                Edit on the compare page
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  clear();
                  setAnnouncement("Comparison cleared");
                  headingRef.current?.focus();
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
      <p className="type-meta mt-6">
        Saved products and your comparison live only in this browser&rsquo;s storage. They are not linked to an account
        and are not sent to Faresolution.
      </p>
    </section>
  );
}
