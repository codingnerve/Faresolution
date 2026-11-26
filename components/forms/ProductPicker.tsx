"use client";

import { useEffect, useRef } from "react";
import { ProductSearchField } from "@/components/compare/ProductSearchField";
import { useProductLookup } from "@/components/compare/useProductLookup";
import { Button } from "@/components/ui/Button";
import { ProductLogo } from "@/components/ui/ProductLogo";

const NO_EXCLUSIONS: readonly string[] = [];

/**
 * Picks one product from the directory: a search combobox over the shared
 * search index (arrow keys, Enter, Escape) that becomes the chosen product
 * with a "Change" button once one is picked. The control in either state has
 * `inputId`, so a form's error summary can focus it and focus stays put when
 * the state switches.
 */
export function ProductPicker({
  inputId,
  label,
  value,
  onChange,
  error,
  errorId,
  hint,
}: {
  inputId: string;
  label: string;
  /** The chosen slug, or "" for none. */
  value: string;
  onChange: (slug: string) => void;
  error?: string;
  errorId: string;
  hint?: string;
}) {
  const lookup = useProductLookup();
  const selected = value ? lookup.get(value) : undefined;
  const focusNext = useRef(false);
  const hintId = `${inputId}-hint`;

  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    document.getElementById(inputId)?.focus();
  }, [selected, inputId]);

  const choose = (slug: string) => {
    focusNext.current = true;
    onChange(slug);
  };

  return (
    <div>
      {selected ? (
        <div>
          <p id={`${inputId}-label`} className="mb-1.5 block text-sm font-medium text-navy">
            {label}
          </p>
          <div
            role="group"
            aria-labelledby={`${inputId}-label`}
            className="flex items-center gap-3 rounded-md border border-line-strong bg-surface p-3 shadow-card"
          >
            <ProductLogo name={selected.name} color={selected.brandColor} logo={selected.logo} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{selected.name}</p>
              <p className="type-meta truncate">
                {[selected.vendorName, selected.categoryName].filter(Boolean).join(" · ")}
              </p>
            </div>
            <Button
              id={inputId}
              variant="secondary"
              size="sm"
              aria-label={`Change product (selected: ${selected.name})`}
              onClick={() => choose("")}
            >
              Change
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ProductSearchField
            label={label}
            inputId={inputId}
            exclude={NO_EXCLUSIONS}
            onSelect={choose}
            placeholder="Search by product or company name"
            invalid={Boolean(error)}
            describedBy={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          />
          {hint && (
            <p id={hintId} className="type-meta mt-1.5">
              {hint}
            </p>
          )}
        </>
      )}
      {error && !selected && (
        <p id={errorId} className="mt-1.5 text-[0.8125rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
