"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { buttonClasses, type ButtonSize } from "@/components/ui/Button";
import { saveAnnouncement } from "@/lib/products/save-announcement";
import { isListPersisted, useStoredList } from "@/lib/storage";
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
 * when storage is blocked). Like CompareButton, the name stays "Save <product>"
 * and `aria-pressed` alone carries the state (the icon and tint show it
 * visually), so the state is not announced twice. Not pressed until hydrated,
 * then the stored state.
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
          // Read back whether the write reached storage: never claim "saved in this browser" for a memory-only list.
          setAnnouncement(saveAnnouncement({ name, saved: nowSaved, persisted: isListPersisted(SAVED_PRODUCTS_KEY) }));
        }}
        title={
          isSaved
            ? isListPersisted(SAVED_PRODUCTS_KEY)
              ? "Saved in this browser"
              : "Saved for this visit only"
            : "Save to this browser"
        }
        className={cn(
          buttonClasses({ variant: "secondary", size }),
          isSaved && "border-navy/40 bg-blue-tint text-navy hover:bg-blue-tint",
          className,
        )}
      >
        <Icon aria-hidden="true" strokeWidth={2} />
        Save
        <span className="sr-only"> {name}</span>
      </button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
