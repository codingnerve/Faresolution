"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type ShareState = "idle" | "copied" | "failed";

/**
 * Copies a link to the clipboard. Where the Clipboard API is missing or
 * refuses (insecure origin, denied permission, some embedded browsers), it
 * shows the link in a read-only field, selected, for copying by hand.
 *
 * `inRow`: the button sits in a wrapping flex row of buttons (article share
 * links). The button then joins that row as its own item and the fallback
 * field breaks onto a full-width line below, instead of the whole control
 * jumping to a row of its own.
 */
export function ShareButton({ url, label = "Copy link", inRow = false }: { url: string; label?: string; inRow?: boolean }) {
  const [state, setState] = useState<ShareState>("idle");
  const fieldRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (state === "copied") {
      const timer = setTimeout(() => setState("idle"), 3000);
      return () => clearTimeout(timer);
    }
    if (state === "failed") {
      fieldRef.current?.focus();
      fieldRef.current?.select();
    }
  }, [state]);

  async function copy() {
    try {
      if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className={inRow ? "contents" : "min-w-0"}>
      <Button variant="secondary" onClick={copy}>
        {state === "copied" ? <Check aria-hidden="true" strokeWidth={2.25} /> : <Link2 aria-hidden="true" strokeWidth={2} />}
        {state === "copied" ? "Link copied" : label}
      </Button>
      <p role="status" className="sr-only">
        {state === "copied" ? "Link copied to the clipboard." : ""}
      </p>
      {state === "failed" && (
        // In a row, a full-basis wrapper forces the line break; the field keeps its own width cap.
        <div className={inRow ? "basis-full pt-0.5" : "mt-3"}>
          <div className="max-w-md">
            <label htmlFor={`${id}-url`} className="type-meta block">
              Copying is not available in this browser. Copy the link below instead.
            </label>
            <input
              ref={fieldRef}
              id={`${id}-url`}
              type="text"
              readOnly
              value={url}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-1.5 h-10 w-full rounded-md border border-line-strong bg-surface-alt px-3 font-mono text-[0.8125rem] text-ink"
            />
          </div>
        </div>
      )}
    </div>
  );
}
