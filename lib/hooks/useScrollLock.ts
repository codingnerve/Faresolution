"use client";

import { useEffect } from "react";

/**
 * Stops the page behind a modal (drawer, slide-over) from scrolling while
 * `active` is true, restoring the previous overflow styles afterwards.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const { documentElement: html, body } = document;
    const previous = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous.html;
      body.style.overflow = previous.body;
    };
  }, [active]);
}
