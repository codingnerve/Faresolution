import { ArrowDown, ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import type { FaqItem } from "@/lib/data/types";
import { faqJsonLd, safeJsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/utils";

export interface LegalSection {
  /** Anchor id, e.g. "collection" for /privacy#collection. */
  id: string;
  heading: string;
  body: ReactNode;
}

export interface LegalGlanceItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface LegalRelatedLink {
  title: string;
  body: string;
  href: string;
}

type LegalDocumentProps = {
  title: string;
  intro: ReactNode;
  /** Section the "Read the policy" button jumps to. */
  startId: string;
  /** Short topic chips under the intro ("DPDP Act", "Your rights"). */
  chips: readonly string[];
  effectiveDate: string;
  updatedDate: string;
  /** Shown under the dates (e.g. the draft notice). */
  notice?: ReactNode;
  glance: readonly LegalGlanceItem[];
  sections: readonly LegalSection[];
  faq: readonly FaqItem[];
  related: readonly LegalRelatedLink[];
  contactEmail: { label: string; href: string };
  /** Label of the hero button that jumps to `startId`. */
  readLabel?: string;
  /** Closing band copy. */
  closing?: { title: string; body: string };
};

const DEFAULT_CLOSING = {
  title: "Questions about your data?",
  body: "Write to us about this policy, a request about your information or a grievance. We reply within the time the law requires.",
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Long-form legal page: hero with jump links and topic chips, an "At a glance"
 * summary, a numbered contents list (sticky beside the text on large screens),
 * numbered sections, FAQ, related pages and a closing contact band.
 */
export function LegalDocument({
  title,
  intro,
  startId,
  chips,
  effectiveDate,
  updatedDate,
  notice,
  glance,
  sections,
  faq,
  related,
  contactEmail,
  readLabel = "Read the policy",
  closing = DEFAULT_CLOSING,
}: LegalDocumentProps) {
  const faqLd = faqJsonLd([...faq]);

  return (
    <>
      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-line bg-surface-alt">
        <div aria-hidden="true" className="brand-rule absolute inset-x-0 top-0" />
        <Container className="py-10 sm:py-14">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
          <p className="type-label mt-8 text-blue-ink">§ Legal</p>
          <h1 className="type-display mt-3 max-w-3xl text-navy">{title}</h1>
          <div className="type-body mt-4 max-w-2xl text-[1.0625rem] text-subtle">{intro}</div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={`#${startId}`} size="lg">
              {readLabel}
              <ArrowDown aria-hidden="true" strokeWidth={2} />
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Ask us a question
            </Button>
          </div>

          <ul aria-label="Topics covered" className="mt-7 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li
                key={chip}
                className="inline-flex h-7 items-center rounded-sm border border-line-strong bg-surface px-2.5 text-xs font-medium tracking-[0.02em] text-ink"
              >
                {chip}
              </li>
            ))}
          </ul>

          <dl className="mt-7 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex gap-1.5">
              <dt className="text-subtle">Effective</dt>
              <dd className="font-medium text-navy">{effectiveDate}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-subtle">Last updated</dt>
              <dd className="font-medium text-navy">{updatedDate}</dd>
            </div>
          </dl>
          {notice}
        </Container>
      </header>

      {/* At a glance */}
      <section aria-labelledby="glance-title" className="border-b border-line">
        <Container className="py-12 sm:py-16">
          <p className="type-label">At a glance</p>
          <h2 id="glance-title" className="type-h2 mt-2 text-navy">
            The short version
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {glance.map(({ icon: Icon, title: itemTitle, body }) => (
              <li
                key={itemTitle}
                className="rounded-lg border border-line bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-0.5 hover:shadow-raised motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-md bg-blue-tint text-blue-ink">
                  <Icon aria-hidden="true" className="size-[1.125rem]" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-[0.9375rem] font-semibold text-navy">{itemTitle}</h3>
                <p className="mt-1.5 text-sm leading-6 text-subtle">{body}</p>
              </li>
            ))}
          </ul>
          <p className="type-meta mt-5">This summary is for convenience and does not replace the full policy below.</p>
        </Container>
      </section>

      {/* Contents + sections */}
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] lg:gap-16">
          <nav
            aria-label="On this page"
            className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-h-[calc(100vh-var(--header-h)-3rem)] lg:self-start lg:overflow-y-auto"
          >
            <p className="type-label mb-4">On this page</p>
            <ol className="space-y-1 border-l border-line">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px flex gap-3 rounded-r-xs border-l-2 border-transparent py-1.5 pl-4 text-sm leading-5 text-ink hover:border-blue hover:text-blue-ink"
                  >
                    <span className="font-mono text-xs leading-5 text-subtle tabular-nums">{pad(index + 1)}</span>
                    <span>{section.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-reading min-w-0">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className={cn("scroll-mt-[calc(var(--header-h)+1.5rem)]", index > 0 && "mt-14")}
              >
                <p className="font-mono text-sm font-medium text-blue-ink tabular-nums">{pad(index + 1)}</p>
                <h2 id={`${section.id}-title`} className="type-h2 mt-1 text-navy">
                  {section.heading}
                </h2>
                <div aria-hidden="true" className="mt-4 mb-5 border-b border-dashed border-line-strong" />
                <div className="space-y-4">{section.body}</div>
              </section>
            ))}
          </div>
        </div>
      </Container>

      {/* FAQ */}
      {faq.length > 0 && (
        <section aria-labelledby="legal-faq-title" className="border-t border-line bg-surface-alt">
          <Container className="py-12 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] lg:gap-16">
              <div>
                <p className="type-label">FAQ</p>
                <h2 id="legal-faq-title" className="type-h2 mt-2 text-navy">
                  Common questions
                </h2>
              </div>
              <Faq items={faq} className="max-w-reading" />
            </div>
          </Container>
        </section>
      )}

      {/* Related */}
      <section aria-labelledby="legal-related-title" className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <h2 id="legal-related-title" className="type-label">
            Related
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-raised"
                >
                  <span className="flex items-center justify-between gap-3 text-base font-semibold text-navy group-hover:text-blue-ink">
                    {link.title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="mt-1.5 text-sm leading-6 text-subtle">{link.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Closing band */}
      <section aria-labelledby="legal-cta-title" className="relative isolate overflow-hidden border-b border-white/10 bg-navy text-white">
        <div aria-hidden="true" className="depth-grid [--grid-line:rgb(159_180_242/0.14)]" />
        <Container className="relative py-14 sm:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 id="legal-cta-title" className="type-h2 text-white">
                {closing.title}
              </h2>
              <p className="type-body mt-3 text-white/75">{closing.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/contact" size="lg" className="bg-white text-navy hover:bg-blue-tint">
                Contact us
              </Button>
              <a
                href={contactEmail.href}
                className="inline-flex h-12 items-center rounded-md border border-white/25 px-5 text-[0.9375rem] font-medium text-white transition-colors duration-150 hover:bg-white/10"
              >
                {contactEmail.label}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />}
    </>
  );
}

/* Body primitives, so section copy stays consistent. */

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="type-body text-ink">{children}</p>;
}

export function LegalSubhead({ children }: { children: ReactNode }) {
  return <h3 className="type-h3 pt-2 text-navy">{children}</h3>;
}

export function LegalList({ items }: { items: readonly { title?: string; body: ReactNode }[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={item.title ?? index} className="flex gap-3 text-[0.9375rem] leading-7 text-ink">
          <span aria-hidden="true" className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-blue" />
          <span>
            {item.title && <strong className="font-semibold text-navy">{item.title}: </strong>}
            {item.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-blue/15 bg-blue-tint px-4 py-3.5 text-[0.9375rem] leading-7 text-ink">
      {children}
    </div>
  );
}

export function LegalTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-surface-alt">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="type-label px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className={cn("px-4 py-3 align-top leading-6", c === 0 ? "font-mono text-[0.8125rem] text-navy" : "text-ink")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
