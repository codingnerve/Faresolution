"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { RouteChangeListener } from "./RouteChangeListener";
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
      {/* Results close the panel themselves; this also covers back/forward. */}
      <RouteChangeListener onChange={() => setOpen(false)} />
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        // The panel only exists while open.
        aria-controls={open ? panelId : undefined}
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
            // Focusable so a click on blank panel space keeps focus here, where Escape still works.
            tabIndex={-1}
            className="absolute inset-x-0 top-full z-40 border-b border-line bg-surface shadow-overlay focus:outline-none"
            onKeyDown={(event) => {
              // The input handles its own Escape (and prevents the default).
              if (event.key === "Escape" && !event.defaultPrevented) {
                event.preventDefault();
                close(true);
              }
            }}
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
