"use client";

import { CircleCheck, TriangleAlert } from "lucide-react";
import type { ReactNode, Ref } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { SUBMISSION_NOTICE } from "@/lib/submissions";
import { cn } from "@/lib/utils";

/**
 * Shared form primitives (labels, hints, inline errors, the error summary,
 * the honeypot and the post-submit notice), used by every form that
 * validates with react-hook-form and zod.
 */

/** Base classes for text inputs, textareas and selects; add a height or padding. */
export const inputClass =
  "block w-full rounded-md border border-line-strong bg-surface px-3.5 text-sm text-ink placeholder:text-subtle hover:border-muted/60 focus-visible:border-blue aria-[invalid=true]:border-danger";

/** Joins the ids that describe a control, skipping empty ones. */
export function describedBy(...ids: (string | false | undefined | null)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined === "" ? undefined : joined;
}

/**
 * A label, an optional hint (`${id}-hint`), the control, and its inline error
 * (`errorId`). The control itself sets `aria-describedby` from those ids.
 */
export function Field({
  id,
  label,
  hint,
  error,
  errorId,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  errorId: string;
  /** Adds "(optional)" to the label. */
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label}
        {optional && <span className="font-normal text-subtle"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="type-meta mt-0.5 mb-1.5">
          {hint}
        </p>
      )}
      {!hint && <div className="mb-1.5" />}
      {children}
      {error && (
        <p id={errorId} className="mt-1.5 text-[0.8125rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SummaryItem {
  name: string;
  label: string;
  message: string;
}

/**
 * The form's alert region: the list of fields to fix after a failed submit
 * (each links to and focuses its field), or a neutral retry message when the
 * honeypot alone was filled. The `role="alert"` wrapper is always rendered so
 * its content is announced when it appears.
 */
export function FormAlert({
  showSummary,
  items,
  summaryTitle,
  retryMessage,
  fieldHref,
  onJump,
}: {
  showSummary: boolean;
  items: SummaryItem[];
  /** Heading of the summary for `count` fields. */
  summaryTitle: (count: number) => string;
  /** Shown when set and the summary is not. */
  retryMessage: string | null;
  fieldHref: (name: string) => string;
  onJump: (name: string) => void;
}) {
  return (
    <div role="alert">
      {retryMessage && !showSummary && (
        <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-tint p-4 text-sm font-semibold text-danger sm:p-5">
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
          {retryMessage}
        </p>
      )}
      {showSummary && (
        <div className="rounded-lg border border-danger/30 bg-danger-tint p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-danger">
            <TriangleAlert aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
            {summaryTitle(items.length)}
          </p>
          {items.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-9 text-sm text-ink">
              {items.map((item) => (
                <li key={item.name}>
                  <a
                    href={fieldHref(item.name)}
                    onClick={(event) => {
                      event.preventDefault();
                      onJump(item.name);
                    }}
                    className="rounded-xs underline underline-offset-2 hover:text-navy"
                  >
                    {item.label}
                  </a>
                  : {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** "Please fix 2 fields before ..." */
export function fixFieldsTitle(count: number, action: string): string {
  return `Please fix ${count} ${count === 1 ? "field" : "fields"} before ${action}.`;
}

/**
 * Honeypot: hidden from people and assistive technology; bots tend to fill
 * it. The form must be `relative` so the off-screen wrapper does not scroll.
 */
export function HoneypotInput({ id, registration }: { id: string; registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <input id={id} type="text" tabIndex={-1} autoComplete="off" {...registration} />
    </div>
  );
}

/**
 * The confirmation that replaces a form after submit. Honest in both cases:
 * a green check only when the entry is really in browser storage, a warning
 * when it could not be stored. The heading takes focus (pass `headingRef`).
 */
export function SubmissionResult({
  title,
  body,
  persisted,
  showStorageNotice,
  headingRef,
  children,
  className,
}: {
  title: string;
  body: string;
  persisted: boolean;
  showStorageNotice: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  /** Actions (for example "Start again"). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-line bg-surface-alt p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        {persisted ? (
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={2} />
        ) : (
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={2} />
        )}
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className="type-h3 text-navy outline-none">
            {title}
          </h2>
          <p className="type-body mt-2 text-ink">{body}</p>
          {showStorageNotice && <p className="type-meta mt-2">{SUBMISSION_NOTICE}</p>}
          {children && <div className="mt-5 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
