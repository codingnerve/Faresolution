"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/ui/Logo";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useMounted } from "@/lib/hooks/useMounted";
import { useScrollLock } from "@/lib/hooks/useScrollLock";
import { cn } from "@/lib/utils";
import {
  allCategoriesLink,
  allIndustriesLink,
  allResourcesLink,
  vendorsLink,
  type NavLink,
  type NavModel,
} from "./navigation";
import { RouteChangeListener } from "./RouteChangeListener";

type SectionKey = "categories" | "industries" | "resources";

/**
 * Slide-out navigation drawer for screens below `lg`. A modal dialog: focus is
 * trapped inside, the page behind does not scroll, Escape or the close button
 * closes it and returns focus to the menu button, and it closes on navigation.
 */
export function MobileNav({ nav, className }: { nav: NavModel; className?: string }) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SectionKey | null>(null);
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const dialogId = useId();
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function close(returnFocus: boolean) {
    setOpen(false);
    setSection(null);
    if (returnFocus) triggerRef.current?.focus();
  }

  // Lock page scroll behind the drawer and keep focus inside it.
  useScrollLock(open);
  const trapFocus = useFocusTrap(panelRef, { active: open, initialFocusRef: closeRef });

  useEffect(() => {
    if (!open) return;
    // The drawer is for small screens only: close it if the viewport grows.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => {
      if (desktop.matches) {
        setOpen(false);
        setSection(null);
      }
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    trapFocus(event);
  }

  function onPanelClick(event: MouseEvent<HTMLDivElement>) {
    // Following any link closes the drawer, even one to the current page.
    if ((event.target as Element).closest("a[href]")) close(false);
  }

  const toggleSection = (key: SectionKey) => setSection((s) => (s === key ? null : key));

  const drawer = (
    <AnimatePresence>
      {open && (
        <div key="mobile-nav" className="fixed inset-0 z-50 lg:hidden" onKeyDown={onKeyDown}>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-navy/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={() => close(true)}
          />
          <motion.div
            ref={panelRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            // Focusable so a click on blank panel space keeps focus in the
            // dialog (not on <body>), where Escape and the Tab trap still work.
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-[calc(100%-2.5rem)] max-w-sm flex-col bg-surface shadow-overlay focus:outline-none"
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
            onClick={onPanelClick}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
              <Link href="/" className="rounded-sm" aria-label="Faresolution home">
                <Logo size="sm" />
              </Link>
              <h2 id={titleId} className="sr-only">
                Site navigation
              </h2>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close menu"
                onClick={() => close(true)}
                className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-surface-alt"
              >
                <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
              <ul className="space-y-0.5">
                <DrawerLink href="/software">Software</DrawerLink>
                <DrawerSection
                  label="Categories"
                  open={section === "categories"}
                  onToggle={() => toggleSection("categories")}
                  reduceMotion={!!reduceMotion}
                >
                  <ul className="space-y-3 pb-2">
                    {nav.categoryGroups.map((group) => (
                      <li key={group.href}>
                        <Link
                          href={group.href}
                          className="block rounded-md px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-alt"
                        >
                          {group.label}
                        </Link>
                        {group.links.length > 0 && (
                          <ul className="ml-3 border-l border-line pl-2">
                            {group.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  className="block rounded-md px-3 py-1.5 text-sm text-subtle hover:bg-surface-alt hover:text-ink"
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                  <SectionFooter link={allCategoriesLink} />
                </DrawerSection>
                <DrawerLink href="/compare">Compare</DrawerLink>
                <DrawerLink href="/alternatives">Alternatives</DrawerLink>
                <DrawerSection
                  label="Industries"
                  open={section === "industries"}
                  onToggle={() => toggleSection("industries")}
                  reduceMotion={!!reduceMotion}
                >
                  <SectionLinks links={nav.industries} />
                  <SectionFooter link={allIndustriesLink} />
                </DrawerSection>
                <DrawerSection
                  label="Resources"
                  open={section === "resources"}
                  onToggle={() => toggleSection("resources")}
                  reduceMotion={!!reduceMotion}
                >
                  <SectionLinks links={nav.resources} />
                  <SectionFooter link={allResourcesLink} />
                </DrawerSection>
              </ul>
            </nav>

            <div className="shrink-0 border-t border-line p-4">
              <Link
                href={vendorsLink.href}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-medium text-white hover:bg-navy-soft"
              >
                {vendorsLink.label}
                <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        // The dialog only exists while open.
        aria-controls={open ? dialogId : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-surface-alt",
          className,
        )}
      >
        <Menu aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </button>
      <RouteChangeListener onChange={() => close(false)} />
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}

function DrawerLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-11 items-center rounded-md px-3 text-[0.9375rem] font-medium text-ink hover:bg-surface-alt"
      >
        {children}
      </Link>
    </li>
  );
}

function DrawerSection({
  label,
  open,
  onToggle,
  reduceMotion,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const contentId = useId();
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        onClick={onToggle}
        className="flex h-11 w-full items-center justify-between rounded-md px-3 text-left text-[0.9375rem] font-medium text-ink hover:bg-surface-alt"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 text-muted transition-transform duration-150", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={contentId}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <div className="px-1 pt-1 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function SectionLinks({ links }: { links: NavLink[] }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-surface-alt"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SectionFooter({ link }: { link: NavLink }) {
  return (
    <Link
      href={link.href}
      className="mt-1 inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-blue-ink hover:text-navy"
    >
      {link.label}
      <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
    </Link>
  );
}
