"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { compareHref, MAX_COMPARE, MIN_COMPARE } from "@/lib/compare/slug";
import { useCompare, useCompareNotice } from "@/lib/compare/useCompare";
import { useProductLookup } from "./useProductLookup";

/**
 * Floating bar with the visitor's compare selection, mounted once in the root
 * layout. Hidden while the selection is empty, on /compare (the picker there
 * shows the same selection) and on the comparison of the selected products. Sits below the header menus and drawers
 * (z-30 vs z-40/z-50), and an in-flow spacer of its height keeps the end of
 * the footer reachable above it.
 */
export function CompareTray() {
  // usePathname can suspend on routes with params that were not prerendered.
  return (
    <Suspense fallback={null}>
      <Tray />
    </Suspense>
  );
}

function Tray() {
  const pathname = usePathname();
  const { slugs, remove, clear } = useCompare();
  const notice = useCompareNotice();
  const lookup = useProductLookup();
  const reduceMotion = useReducedMotion();
  const barRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [height, setHeight] = useState(0);
  // Announced from a region that stays mounted after the tray itself unmounts.
  // Shown only while the selection is empty, and reset by the next selection.
  const [emptied, setEmptied] = useState(false);

  /** The tray is about to unmount: keep focus off <body> and say what happened. */
  function onEmptied() {
    setEmptied(true);
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }

  // Hidden on /compare (the picker shows the selection) and on the comparison
  // of exactly the selected products.
  const visible = slugs.length > 0 && pathname !== "/compare" && pathname !== compareHref(slugs);
  const count = slugs.length;
  // A new selection ends the "cleared" state, so emptying it later some other
  // way (a card's Compare button) does not announce "cleared" again.
  if (emptied && count > 0) setEmptied(false);

  useEffect(() => {
    const bar = barRef.current;
    if (!visible || !bar) return;
    const update = () => setHeight(bar.offsetHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <>
      <p role="status" className="sr-only">
        {emptied && count === 0 ? "Compare selection cleared." : ""}
      </p>
      {visible && <div aria-hidden="true" style={{ height }} />}
      <AnimatePresence>
        {visible && (
          <motion.section
            key="compare-tray"
            ref={barRef}
            aria-labelledby="compare-tray-heading"
            initial={reduceMotion ? false : { y: "100%" }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line-strong bg-surface shadow-overlay"
          >
            <Container className="flex flex-wrap items-center gap-x-5 gap-y-2.5 py-3">
              <h2
                id="compare-tray-heading"
                ref={headingRef}
                tabIndex={-1}
                className="text-sm font-semibold text-navy focus:outline-none"
              >
                Compare{" "}
                <span className="font-normal text-subtle tabular-nums">
                  {count} of {MAX_COMPARE}
                </span>
              </h2>

              <ul className="order-3 flex w-full min-w-0 gap-3 pt-1.5 sm:order-2 sm:pt-0 sm:w-auto sm:flex-1 sm:flex-wrap sm:gap-2">
                {slugs.map((slug) => {
                  const product = lookup.get(slug);
                  const name = product?.name ?? slug;
                  return (
                    <li
                      key={slug}
                      className="relative flex items-center gap-2 sm:rounded-md sm:border sm:border-line sm:bg-surface-alt sm:py-1 sm:pr-1 sm:pl-1.5"
                    >
                      <ProductLogo name={name} color={product?.brandColor ?? "#17243A"} logo={product?.logo} size={32} className="sm:size-6" />
                      <span className="sr-only text-[0.8125rem] font-medium text-ink sm:not-sr-only sm:max-w-36 sm:truncate">
                        {name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          remove(slug);
                          if (count === 1) onEmptied();
                          else headingRef.current?.focus();
                        }}
                        aria-label={`Remove ${name} from compare`}
                        title={`Remove ${name}`}
                        className="absolute -top-2 -right-2.5 grid size-6 place-items-center rounded-full border border-line-strong bg-surface text-subtle shadow-card hover:text-navy sm:static sm:border-0 sm:bg-transparent sm:shadow-none"
                      >
                        <X aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clear();
                    onEmptied();
                  }}
                >
                  Clear
                </Button>
                {count >= MIN_COMPARE ? (
                  <Button href={compareHref(slugs)} size="sm">
                    Compare {count}
                    <ArrowRight aria-hidden="true" strokeWidth={2} />
                  </Button>
                ) : (
                  <span className="type-meta">Add one more to compare</span>
                )}
              </div>
            </Container>
            <p
              role="status"
              className={
                notice.text ? "border-t border-line bg-sponsored-tint px-4 py-2 text-center text-[0.8125rem] text-sponsored" : "sr-only"
              }
            >
              {notice.text}
            </p>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
