import { FileWarning } from "lucide-react";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

/** Page header for the company pages (about, contact, privacy, terms). */
export function CompanyHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  /** Extra content under the intro, such as a draft notice. */
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-surface-alt">
      <Container className="py-8 sm:py-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        <p className="type-label mt-6">{eyebrow}</p>
        <h1 className="type-h1 mt-2 max-w-3xl text-navy">{title}</h1>
        <div className="type-body mt-3 max-w-2xl text-subtle">{intro}</div>
        {children}
      </Container>
    </header>
  );
}

/** Date the legal drafts were prepared, shown on each. */
export const LEGAL_DRAFT_DATE = "26 November 2026";

/**
 * Says plainly that a legal page is a working draft, not reviewed by a lawyer
 * and not yet in force.
 */
export function LegalDraftNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      aria-label="Draft notice"
      className={cn(
        "mt-6 flex max-w-3xl items-start gap-3 rounded-md border border-sponsored/20 bg-sponsored-tint px-4 py-3",
        className,
      )}
    >
      <FileWarning aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sponsored" strokeWidth={2} />
      <p className="text-sm leading-6 text-ink">
        <span className="font-semibold text-navy">Draft &mdash; to be reviewed with counsel before launch.</span> This
        text describes how the demonstration site works today. It has not been reviewed by a lawyer and may change
        before Faresolution launches. Draft prepared {LEGAL_DRAFT_DATE}.
      </p>
    </div>
  );
}
