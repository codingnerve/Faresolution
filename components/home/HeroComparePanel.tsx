"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { cn } from "@/lib/utils";

export interface PanelProduct {
  name: string;
  vendorName: string | null;
  brandColor: string;
  href: string;
}

export interface PanelComparison {
  key: string;
  /** Short tab label, e.g. "CRM". */
  label: string;
  href: string;
  products: [PanelProduct, PanelProduct];
  rows: { label: string; values: [string, string] }[];
}

const NOT_VERIFIED = "Not verified";

/**
 * A live preview of real comparison data in the hero. Tabs switch between a
 * few popular head-to-heads; unknown facts read "Not verified".
 */
export function HeroComparePanel({ comparisons }: { comparisons: PanelComparison[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = comparisons[activeIndex] ?? comparisons[0];
  if (!active) return null;

  function select(index: number) {
    const next = (index + comparisons.length) % comparisons.length;
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(activeIndex + 1),
      ArrowLeft: () => select(activeIndex - 1),
      Home: () => select(0),
      End: () => select(comparisons.length - 1),
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  const panelId = `${baseId}-panel`;
  const [a, b] = active.products;

  return (
    <div className="rounded-lg border border-line bg-surface shadow-raised">
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 pt-4 sm:px-5">
        <p className="type-label hidden pb-3 sm:block">Side by side</p>
        <div
          role="tablist"
          aria-label="Example comparisons"
          className="-mb-px flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {comparisons.map((comparison, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={comparison.key}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                onKeyDown={onKeyDown}
                className={cn(
                  "relative shrink-0 pb-3 text-[0.8125rem] font-medium whitespace-nowrap transition-colors focus-visible:outline-offset-[-2px]",
                  selected ? "text-navy" : "text-subtle hover:text-ink",
                )}
              >
                {comparison.label}
                {selected && (
                  <motion.span
                    layoutId={`${baseId}-indicator`}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-navy"
                    transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={`${baseId}-tab-${activeIndex}`} className="px-4 pt-5 pb-5 sm:px-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.2, 0, 0, 1] }}
          >
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">
                {a.name} compared with {b.name}
              </caption>
              <colgroup>
                <col className="w-[30%]" />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <td />
                  {[a, b].map((product) => (
                    <th key={product.href} scope="col" className="pb-4 align-top font-normal">
                      <Link href={product.href} className="group/p flex flex-col items-start gap-2 rounded-xs pr-2">
                        <LogoMark name={product.name} color={product.brandColor} size={32} />
                        <span className="text-sm leading-5 font-semibold text-navy group-hover/p:text-blue-ink">
                          {product.name}
                        </span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.rows.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th scope="row" className="py-2.5 pr-3 align-top text-[0.8125rem] leading-5 font-normal text-subtle">
                      {row.label}
                    </th>
                    {row.values.map((value, index) => (
                      <td
                        key={index}
                        className={cn(
                          "py-2.5 pr-4 align-top text-[0.8125rem] leading-5",
                          value === NOT_VERIFIED ? "text-subtle italic" : "text-ink",
                        )}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="type-meta">Unknown facts stay marked, never guessed.</p>
          <Link
            href={active.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xs text-[0.8125rem] font-medium text-blue-ink hover:text-navy"
          >
            Full comparison
            <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
