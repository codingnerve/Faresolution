import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export const VENDOR_LINKS = [
  { label: "Overview", href: "/vendors" },
  { label: "Plans", href: "/vendors/pricing" },
  { label: "Register interest", href: "/vendors/register" },
  { label: "Claim a listing", href: "/vendors/claim-listing" },
  { label: "Resources", href: "/vendors/resources" },
  { label: "Success stories", href: "/vendors/success-stories" },
] as const;

export type VendorHref = (typeof VENDOR_LINKS)[number]["href"];

/** Link bar between the vendor pages. */
export function VendorNav({ current, className }: { current?: VendorHref; className?: string }) {
  return (
    <nav aria-label="For vendors" className={cn("-mx-1 overflow-x-auto", className)}>
      <ul className="flex min-w-max gap-1 px-1">
        {VENDOR_LINKS.map((link) => {
          const active = link.href === current;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-navy text-white" : "text-ink hover:bg-surface",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Page header for the vendor sub-pages (the landing page has its own hero). */
export function VendorsHeader({
  current,
  title,
  intro,
  eyebrow = "For vendors",
}: {
  current: VendorHref;
  title: string;
  intro: ReactNode;
  eyebrow?: string;
}) {
  const crumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "For vendors", href: "/vendors" },
    { label: title },
  ];
  return (
    <header className="border-b border-line bg-surface-alt">
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <p className="type-label mt-6">{eyebrow}</p>
        <h1 className="type-h1 mt-2 max-w-3xl text-navy">{title}</h1>
        <div className="type-body mt-3 max-w-2xl text-subtle">{intro}</div>
        <VendorNav current={current} className="mt-8" />
      </Container>
    </header>
  );
}

/** Plain statement that the vendor programme is not open yet. */
export function VendorProgrammeStatus({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      role="note"
      aria-label="Vendor programme status"
      className={cn("rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5", className)}
    >
      <p className="text-sm font-semibold text-navy">The vendor programme opens at launch</p>
      <p className="type-body mt-1 text-subtle">
        {children ??
          "Nothing on these pages is live yet: there are no vendor accounts, claims are not reviewed, no buyer requests are passed on and no placements are sold. Forms here keep what you enter in your browser only."}
      </p>
    </div>
  );
}
