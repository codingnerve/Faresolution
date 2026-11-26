"use client";

import { useCallback, useEffect, type KeyboardEvent, type RefObject } from "react";

export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
  /** Whether the trap is on (the dialog is open). */
  active: boolean;
  /** Element focused when the trap turns on; defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Keeps keyboard focus inside `containerRef` while `active`: focuses the
 * initial element when it turns on and returns a keydown handler that wraps
 * Tab / Shift+Tab at the ends. Attach the handler to the dialog (or a wrapper
 * around it); Escape handling and focus return stay with the caller.
 */
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  { active, initialFocusRef }: FocusTrapOptions,
): (event: KeyboardEvent<HTMLElement>) => void {
  useEffect(() => {
    if (!active) return;
    const target =
      initialFocusRef?.current ?? containerRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
    target?.focus();
  }, [active, containerRef, initialFocusRef]);

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const container = containerRef.current;
      if (event.key !== "Tab" || !container) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;
      // The container itself may hold focus (tabIndex -1, after a click on blank space).
      if (event.shiftKey && (activeEl === first || activeEl === container || !container.contains(activeEl))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeEl === last || !container.contains(activeEl))) {
        event.preventDefault();
        first.focus();
      }
    },
    [containerRef],
  );
}
