"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SearchBox } from "./SearchBox";

/**
 * Header search: an icon button that opens a full-width search panel under
 * the sticky header. Must sit inside the header without a positioned parent
 * in between, so the panel spans the header's full width.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  // Close on a pointer press anywhere outside the panel and its trigger.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
          }
        }}
        className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-alt"
      >
        {open ? (
          <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
        ) : (
          <Search aria-hidden="true" className="size-5" strokeWidth={1.75} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="search-panel"
            ref={panelRef}
            id={panelId}
            initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.2, 0, 0, 1] }}
            className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface shadow-overlay"
            onBlur={(event) => {
              const next = event.relatedTarget as Node | null;
              // Tabbing out of the panel closes it; clicks are handled above.
              if (next && !event.currentTarget.contains(next) && next !== triggerRef.current) {
                setOpen(false);
              }
            }}
          >
            <Container width="narrow" className="py-4 sm:py-6">
              <SearchBox
                variant="overlay"
                label="Search Faresolution"
                autoFocus
                onEscape={() => close(true)}
                onNavigate={() => close(false)}
              />
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
