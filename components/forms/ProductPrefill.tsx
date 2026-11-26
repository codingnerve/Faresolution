"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { productSlugSet } from "@/lib/data/content/slugs";
import { resolvePrefillProduct } from "@/lib/forms/prefill";

/**
 * Reads `?product=<slug>` on the client and reports a known product slug once.
 * The page is a static shell, so the query string is never read on the
 * server; render this inside `<Suspense fallback={null}>` (useSearchParams
 * needs a boundary on a prerendered page). Repeated, malformed and unknown
 * values are ignored.
 */
export function ProductPrefill({ onResolve }: { onResolve: (slug: string) => void }) {
  const params = useSearchParams();
  const values = params.getAll("product");
  const slug = resolvePrefillProduct(values.length === 1 ? values[0] : values, productSlugSet);

  useEffect(() => {
    if (slug) onResolve(slug);
  }, [slug, onResolve]);

  return null;
}
