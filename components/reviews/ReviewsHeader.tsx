import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const REVIEW_LINKS = [
  { label: "Overview", href: "/reviews" },
  { label: "Latest reviews", href: "/reviews/latest" },
  { label: "Most helpful", href: "/reviews/helpful" },
  { label: "Review guidelines", href: "/review-guidelines" },
  { label: "Verification plan", href: "/review-verification" },
] as const;

/** Page header shared by the reviews area, with a link bar between its pages. */
export function ReviewsHeader({
  current,
  crumbs,
  eyebrow = "Reviews",
  title,
  intro,
}: {
  /** Which page of the reviews area this is (an `href` from the link bar), if any. */
  current?: (typeof REVIEW_LINKS)[number]["href"];
  crumbs: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  intro: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-surface-alt">
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <p className="type-label mt-6">{eyebrow}</p>
        <h1 className="type-h1 mt-2 max-w-3xl text-navy">{title}</h1>
        <div className="type-body mt-3 max-w-2xl text-subtle">{intro}</div>
        <nav aria-label="Reviews" className="-mx-1 mt-8 overflow-x-auto">
          <ul className="flex min-w-max gap-1 px-1">
            {REVIEW_LINKS.map((link) => {
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
      </Container>
    </header>
  );
}

/** Banner stating plainly that review collection has not opened. */
export function ReviewsStatus({ className }: { className?: string }) {
  return (
    <div
      role="note"
      aria-label="Review status"
      className={cn("rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5", className)}
    >
      <p className="text-sm font-semibold text-navy">Review collection isn&rsquo;t open yet</p>
      <p className="type-body mt-1 text-subtle">
        No reviews, ratings or review counts exist on Faresolution today. You can write a draft that stays in your
        browser; nothing is sent or published, and nothing has been moderated or verified.
      </p>
    </div>
  );
}
