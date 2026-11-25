"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { useStoredList } from "@/lib/storage";
import { cn } from "@/lib/utils";

/** localStorage key for the products a visitor has saved in this browser. */
export const SAVED_PRODUCTS_KEY = "faresolution:saved-products";

type SaveButtonProps = {
  slug: string;
  name: string;
  size?: ButtonSize;
  className?: string;
};

/**
 * Toggles a product in the visitor's saved list (this browser only; memory
 * when storage is blocked). Shows "Save" until hydrated, then the stored state.
 */
export function SaveButton({ slug, name, size = "md", className }: SaveButtonProps) {
  const [, saved] = useStoredList(SAVED_PRODUCTS_KEY);
  const isSaved = saved.has(slug);
  const Icon = isSaved ? BookmarkCheck : Bookmark;
  // Announced only after a click, not when the stored state loads.
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <button
        type="button"
        aria-pressed={isSaved}
        onClick={() => {
          const nowSaved = saved.toggle(slug);
          setAnnouncement(nowSaved ? `${name} saved in this browser` : `${name} removed from saved products`);
        }}
        title={isSaved ? "Saved in this browser" : "Save to this browser"}
        className={cn(
          buttonClasses({ variant: "secondary", size }),
          isSaved && "border-navy/40 bg-blue-tint text-navy hover:bg-blue-tint",
          className,
        )}
      >
        <Icon aria-hidden="true" strokeWidth={2} />
        {isSaved ? "Saved" : "Save"}
        <span className="sr-only"> {name}</span>
      </button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
