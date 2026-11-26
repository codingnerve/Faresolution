"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import { productHref } from "@/components/layout/navigation";
import { Button } from "@/components/ui/Button";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { compareHref, MAX_COMPARE, MIN_COMPARE } from "@/lib/compare/slug";
import { COMPARE_FULL_MESSAGE, useCompare, useCompareNotice } from "@/lib/compare/useCompare";
import { cn } from "@/lib/utils";
import { ProductSearchField } from "./ProductSearchField";
import { useProductLookup } from "./useProductLookup";

/**
 * The /compare builder: search for products, keep up to four in the visitor's
 * compare selection (the same one the tray and the Compare buttons use), then
 * open the comparison. Empty until hydrated, then shows the stored selection.
 */
export function ComparePicker() {
  const { slugs, add, remove, clear, isFull } = useCompare();
  const notice = useCompareNotice();
  const lookup = useProductLookup();
  const hintId = useId();
  const count = slugs.length;
  const ready = count >= MIN_COMPARE;

  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="type-h3 text-navy">Your comparison</h2>
        <p className="type-meta tabular-nums">
          {count} of {MAX_COMPARE} selected
        </p>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: MAX_COMPARE }, (_, i) => {
          const slug = slugs[i];
          const product = slug ? lookup.get(slug) : undefined;
          if (!slug) {
            return (
              <li
                key={`empty-${i}`}
                className="flex min-h-20 items-center justify-center rounded-md border border-dashed border-line-strong px-4 text-sm text-subtle"
              >
                <span className="sr-only">Slot {i + 1}: </span>
                {i < MIN_COMPARE ? "Add a product" : "Optional"}
              </li>
            );
          }
          const name = product?.name ?? slug;
          return (
            <li key={slug} className="flex min-h-20 items-center gap-3 rounded-md border border-line bg-surface-alt px-3.5 py-3">
              <ProductLogo name={name} color={product?.brandColor ?? "#17243A"} logo={product?.logo} size={36} />
              <div className="min-w-0 flex-1">
                <Link href={productHref(slug)} className="block truncate rounded-xs text-[0.9375rem] font-semibold text-navy hover:text-blue-ink">
                  {name}
                </Link>
                {product?.vendorName && <p className="type-meta truncate">by {product.vendorName}</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(slug)}
                aria-label={`Remove ${name}`}
                title={`Remove ${name}`}
                className="grid size-8 shrink-0 place-items-center rounded-md text-subtle hover:bg-surface hover:text-navy"
              >
                <X aria-hidden="true" className="size-4" strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ol>

      <ProductSearchField
        label="Add a product"
        exclude={slugs}
        onSelect={add}
        disabledReason={isFull ? COMPARE_FULL_MESSAGE : null}
        className="mt-6 max-w-xl"
      />

      <p
        role="status"
        className={cn(notice.text ? "mt-3 rounded-md bg-sponsored-tint px-3 py-2 text-[0.8125rem] text-sponsored" : "sr-only")}
      >
        {notice.text}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        {ready ? (
          <Button href={compareHref(slugs)}>
            Compare now
            <ArrowRight aria-hidden="true" strokeWidth={2} />
          </Button>
        ) : (
          <Button disabled aria-describedby={hintId}>
            Compare now
            <ArrowRight aria-hidden="true" strokeWidth={2} />
          </Button>
        )}
        {count > 0 && (
          <Button variant="ghost" onClick={clear}>
            Clear selection
          </Button>
        )}
        {!ready && (
          <p id={hintId} className="type-meta">
            Select at least {MIN_COMPARE} products to compare.
          </p>
        )}
      </div>
    </div>
  );
}
