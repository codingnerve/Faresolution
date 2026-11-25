"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useMounted } from "@/lib/hooks/useMounted";
import { useScrollLock } from "@/lib/hooks/useScrollLock";

/**
 * Slide-over for the filters below `lg`. A modal dialog: focus is trapped,
 * the page does not scroll, Escape / the close button / the backdrop close it
 * and focus returns to `returnFocusRef`. Closes if the viewport grows to `lg`.
 */
export function FilterDrawer({
  open,
  onClose,
  returnFocusRef,
  title,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
  title: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useScrollLock(open);
  const trapFocus = useFocusTrap(panelRef, { active: open, initialFocusRef: closeRef });

  function close() {
    onClose();
    returnFocusRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => {
      if (desktop.matches) onClose();
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, [open, onClose]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    trapFocus(event);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="filter-drawer" className="fixed inset-0 z-50 lg:hidden" onKeyDown={onKeyDown}>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-navy/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={close}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="absolute inset-y-0 left-0 flex w-[calc(100%-2.5rem)] max-w-sm flex-col bg-surface shadow-overlay"
            initial={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "-100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <h2 id={titleId} className="type-h3 text-navy">
                {title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close filters"
                onClick={close}
                className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-surface-alt"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">{children}</div>
            <div className="shrink-0 border-t border-line p-4">{footer}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
