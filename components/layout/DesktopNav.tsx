"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils";
import { MegaMenu, MenuList } from "./MegaMenu";
import { allIndustriesLink, allResourcesLink, type NavModel } from "./navigation";
import { RouteChangeListener } from "./RouteChangeListener";

type MenuKey = "categories" | "industries" | "resources";

type BarItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "menu"; key: MenuKey; label: string };

const BAR: BarItem[] = [
  { kind: "link", label: "Software", href: "/software" },
  { kind: "menu", key: "categories", label: "Categories" },
  { kind: "link", label: "Compare", href: "/compare" },
  { kind: "link", label: "Alternatives", href: "/alternatives" },
  { kind: "menu", key: "industries", label: "Industries" },
  { kind: "menu", key: "resources", label: "Resources" },
];

const barItemClass =
  "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-alt";

function linksIn(panel: HTMLElement | null | undefined): HTMLAnchorElement[] {
  return Array.from(panel?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);
}

function focusEdge(links: HTMLAnchorElement[], edge: "first" | "last") {
  (edge === "first" ? links[0] : links[links.length - 1])?.focus();
}

/**
 * Desktop navigation bar (disclosure pattern). Menu triggers are buttons with
 * aria-expanded/aria-controls. Keyboard: Left/Right/Home/End move between
 * top-level items; Down/Up on a trigger opens its menu and focuses the first/
 * last link; Up/Down/Home/End move within a menu; Escape closes it and returns
 * focus to its trigger. Tabbing or clicking outside closes the menu.
 */
export function DesktopNav({ nav, className }: { nav: NavModel; className?: string }) {
  const [openKey, setOpenKey] = useState<MenuKey | null>(null);
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const navRef = useRef<HTMLElement>(null);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const panelRefs = useRef<Partial<Record<MenuKey, HTMLDivElement | null>>>({});
  const pendingFocus = useRef<"first" | "last" | null>(null);

  const panelId = (key: MenuKey) => `${baseId}-${key}`;
  const panelLinks = (key: MenuKey) => linksIn(panelRefs.current[key]);

  function triggerFor(key: MenuKey): HTMLElement | null {
    const i = BAR.findIndex((item) => item.kind === "menu" && item.key === key);
    return barRefs.current[i] ?? null;
  }

  // After a keyboard open, move focus into the freshly mounted panel.
  useEffect(() => {
    if (openKey && pendingFocus.current) {
      focusEdge(linksIn(panelRefs.current[openKey]), pendingFocus.current);
      pendingFocus.current = null;
    }
  }, [openKey]);

  // Close on a pointer press outside the navigation.
  useEffect(() => {
    if (!openKey) return;
    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenKey(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openKey]);

  function openWithFocus(key: MenuKey, edge: "first" | "last") {
    if (openKey === key) {
      focusEdge(panelLinks(key), edge);
    } else {
      pendingFocus.current = edge;
      setOpenKey(key);
    }
  }

  function onBarKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    const item = BAR[index];
    const last = BAR.length - 1;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      case "ArrowDown":
      case "ArrowUp":
        if (item.kind === "menu") {
          event.preventDefault();
          openWithFocus(item.key, event.key === "ArrowDown" ? "first" : "last");
        }
        return;
      case "Escape":
        if (openKey) {
          event.preventDefault();
          setOpenKey(null);
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    setOpenKey(null);
    barRefs.current[next]?.focus();
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>, key: MenuKey) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpenKey(null);
      triggerFor(key)?.focus();
      return;
    }
    const links = panelLinks(key);
    if (links.length === 0) return;
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    let next: number;
    switch (event.key) {
      case "ArrowDown":
        next = current < links.length - 1 ? current + 1 : 0;
        break;
      case "ArrowUp":
        next = current > 0 ? current - 1 : links.length - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = links.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    links[next]?.focus();
  }

  function onPanelClick(event: MouseEvent<HTMLDivElement>) {
    // A followed link closes the menu (the header persists across routes).
    if ((event.target as Element).closest("a[href]")) setOpenKey(null);
  }

  function onItemBlur(event: FocusEvent<HTMLLIElement>, key: MenuKey) {
    const next = event.relatedTarget as Node | null;
    // `next` is null for clicks on non-focusable space; the pointer handler covers those.
    if (openKey === key && next && !event.currentTarget.contains(next)) setOpenKey(null);
  }

  const motionProps = {
    initial: { opacity: 0, y: reduceMotion ? 0 : -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -4 },
    transition: { duration: reduceMotion ? 0 : 0.16, ease: [0.2, 0, 0, 1] as const },
  };

  return (
    <nav ref={navRef} aria-label="Main" className={cn("self-stretch", className)}>
      {/* Link clicks close the menu above; this also covers back/forward. */}
      <RouteChangeListener onChange={() => setOpenKey(null)} />
      <ul className="flex h-full items-stretch gap-0.5">
        {BAR.map((item, index) => {
          if (item.kind === "link") {
            return (
              <li key={item.href} className="flex items-center">
                <Link
                  ref={(el) => {
                    barRefs.current[index] = el;
                  }}
                  href={item.href}
                  className={barItemClass}
                  onKeyDown={(e) => onBarKeyDown(e, index)}
                  onClick={() => setOpenKey(null)}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const key = item.key;
          const open = openKey === key;
          const mega = key === "categories";
          return (
            <li
              key={key}
              // The mega menu spans the header; the smaller menus anchor to their item.
              className={cn("flex items-center", !mega && "relative")}
              onBlur={(e) => onItemBlur(e, key)}
            >
              <button
                ref={(el) => {
                  barRefs.current[index] = el;
                }}
                type="button"
                aria-expanded={open}
                // The panel only exists while open.
                aria-controls={open ? panelId(key) : undefined}
                onClick={() => setOpenKey(open ? null : key)}
                onKeyDown={(e) => onBarKeyDown(e, index)}
                className={cn(barItemClass, open && "bg-surface-alt text-navy")}
              >
                {item.label}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-4 text-muted transition-transform duration-150",
                    open && "rotate-180 text-navy",
                  )}
                  strokeWidth={2}
                />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    key={key}
                    id={panelId(key)}
                    ref={(el: HTMLDivElement | null) => {
                      panelRefs.current[key] = el;
                    }}
                    {...motionProps}
                    // Focusable so a click on blank panel space keeps focus in
                    // the menu (not on <body>), where Escape and arrows still work.
                    tabIndex={-1}
                    onKeyDown={(e) => onPanelKeyDown(e, key)}
                    onClick={onPanelClick}
                    className={cn(
                      // Scrolls inside itself on short viewports (header is 4rem).
                      "absolute top-full z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-surface focus:outline-none",
                      mega
                        ? "inset-x-0 border-y border-line shadow-overlay"
                        : cn(
                            "mt-px rounded-lg border border-line shadow-overlay",
                            key === "industries" ? "left-0 w-[28rem]" : "left-0 w-[22rem]",
                          ),
                    )}
                  >
                    {key === "categories" && <MegaMenu groups={nav.categoryGroups} />}
                    {key === "industries" && (
                      <MenuList links={nav.industries} footer={allIndustriesLink} columns={2} />
                    )}
                    {key === "resources" && (
                      <MenuList links={nav.resources} footer={allResourcesLink} />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
