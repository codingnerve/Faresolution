"use client";

import { useRouter } from "next/navigation";
import { compareHrefWith, MAX_COMPARE } from "@/lib/compare/slug";
import { ProductSearchField } from "./ProductSearchField";

/**
 * Adds a product to the comparison on screen by opening the comparison with
 * it (a new URL). Disabled, with the reason shown, at MAX_COMPARE products.
 */
export function AddProductControl({ slugs }: { slugs: readonly string[] }) {
  const router = useRouter();
  const full = slugs.length >= MAX_COMPARE;

  return (
    <ProductSearchField
      label="Add a product to this comparison"
      exclude={slugs}
      disabledReason={full ? `This comparison has the maximum of ${MAX_COMPARE} products. Remove one to add another.` : null}
      onSelect={(slug) => {
        const href = compareHrefWith(slugs, slug);
        if (href) router.push(href);
      }}
    />
  );
}
