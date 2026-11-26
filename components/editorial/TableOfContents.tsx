"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { activeHeadingId, type TocEntry } from "@/lib/editorial";
import { cn } from "@/lib/utils";

/** A heading counts as the current section once its top passes this share of the viewport. */
const ACTIVE_LINE = 0.3;

/**
 * Tracks which heading the reader is in (`activeHeadingId`: the last heading
 * whose top has passed the active line). The observer's band runs from far
 * above the viewport down to that line, so a heading is "intersecting"
 * exactly when its top has passed the line, and every crossing fires the
 * callback, even when a jump (End key, scrollbar drag, find in page, a hash
 * link or restored scroll) moves it from below the viewport to far above in
 * one frame. The observer's first report on observe sets the initial state.
 */
function useActiveHeading(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(" ");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const headings = key
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const update = () => {
      const tops = headings.map((h) => ({ id: h.id, top: h.getBoundingClientRect().top }));
      setActive(activeHeadingId(tops, window.innerHeight * ACTIVE_LINE));
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: `100000px 0px -${(1 - ACTIVE_LINE) * 100}% 0px`,
    });
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [key]);

  return active;
}

function TocList({
  entries,
  active,
  onNavigate,
}: {
  entries: readonly TocEntry[];
  active: string | null;
  onNavigate: () => void;
}) {
  return (
    <ol className="border-l border-line">
      {entries.map((entry) => {
        const current = entry.id === active;
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={current ? "location" : undefined}
              onClick={onNavigate}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pr-2 text-[0.8125rem] leading-5 transition-colors duration-150",
                entry.level === 3 ? "pl-7" : "pl-4",
                current
                  ? "border-blue font-medium text-navy"
                  : "border-transparent text-subtle hover:border-line-strong hover:text-ink",
              )}
            >
              {entry.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "On this page" navigation. On large screens a sticky list with the current
 * section highlighted; on small screens a collapsible panel above the
 * article that closes after a choice. Links are plain fragment anchors: the
 * browser jumps to the heading (no animated scrolling, so nothing to reduce
 * for readers who prefer reduced motion), the header offset comes from
 * `scroll-padding-top`, and it all works without JavaScript.
 */
export function TableOfContents({ entries }: { entries: readonly TocEntry[] }) {
  const active = useActiveHeading(entries.map((e) => e.id));
  const detailsRef = useRef<HTMLDetailsElement>(null);

  if (entries.length === 0) return null;
  const sections = entries.filter((e) => e.level === 2).length;
  const count =
    sections > 0
      ? `${sections} ${sections === 1 ? "section" : "sections"}`
      : `${entries.length} ${entries.length === 1 ? "heading" : "headings"}`;

  // Collapse the mobile panel before the browser follows the link, so the
  // jump lands on the heading in the shortened page.
  const onNavigate = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <>
      <details ref={detailsRef} className="group rounded-md border border-line bg-surface-alt lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-navy [&::-webkit-details-marker]:hidden">
          <span>
            On this page <span className="font-normal text-subtle">({count})</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-subtle transition-transform duration-200 group-open:rotate-180"
            strokeWidth={2}
          />
        </summary>
        <nav aria-label="Table of contents" className="border-t border-line px-4 py-3">
          <TocList entries={entries} active={active} onNavigate={onNavigate} />
        </nav>
      </details>

      <nav
        aria-label="Table of contents"
        className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-2"
      >
        <p className="type-label mb-3">On this page</p>
        <TocList entries={entries} active={active} onNavigate={onNavigate} />
      </nav>
    </>
  );
}
