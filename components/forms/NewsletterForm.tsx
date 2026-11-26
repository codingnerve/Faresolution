"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { HoneypotInput } from "@/components/forms/fields";
import { submissionNotice } from "@/lib/forms/submission-notice";
import { SUBMISSION_NOTICE, isPersisted, saveSubmission } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import {
  HONEYPOT_ERROR,
  HONEYPOT_FIELD,
  isHoneypotOnly,
  newsletterSchema,
  type NewsletterInput,
  type NewsletterValues,
} from "@/lib/validation";

export interface NewsletterFormProps {
  /** `dark` for navy surfaces (footer), `light` elsewhere. */
  tone?: "light" | "dark";
  /** Where the form sits, stored with the entry (e.g. "footer"). */
  source?: string;
  className?: string;
}

/**
 * Newsletter sign-up. Validates with `newsletterSchema` and stores the entry
 * locally via `saveSubmission`; no email is sent in this demo, and the
 * confirmation says so. "Saved" is claimed only when the entry is really in
 * browser storage (read back with `isPersisted`); otherwise the shared "not
 * saved" wording is shown. Has the same honeypot as the other forms.
 */
export function NewsletterForm({ tone = "light", source = "unknown", className }: NewsletterFormProps) {
  const dark = tone === "dark";
  const id = useId();
  const inputId = `${id}-email`;
  const errorId = `${id}-error`;
  // The stored entry's id; whether it is really persisted is read from storage at render.
  const [savedId, setSavedId] = useState<string | null>(null);
  const [retryNeeded, setRetryNeeded] = useState(false);
  // Distinguishes forms when more than one could appear (e.g. "Newsletter sign-up (footer)").
  const formLabel = source === "unknown" ? "Newsletter sign-up" : `Newsletter sign-up (${source})`;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput, unknown, NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", [HONEYPOT_FIELD]: "" },
  });

  const onSubmit = (values: NewsletterValues) => {
    const saved = saveSubmission("newsletter", { email: values.email, source });
    setRetryNeeded(false);
    setSavedId(saved.id);
    reset();
  };

  const onInvalid = (invalid: FieldErrors<NewsletterInput>) => {
    if (isHoneypotOnly(invalid)) {
      // Nothing is stored and success is not claimed; the next attempt is a plain retry.
      setValue(HONEYPOT_FIELD, "");
      setSavedId(null);
      setRetryNeeded(true);
    }
  };

  const fieldError = errors.email?.message;
  // The honeypot message is neutral and is not tied to the email field.
  const error = fieldError ?? (retryNeeded ? HONEYPOT_ERROR : undefined);
  // Read from storage, not remembered: "saved" only if the entry is really stored.
  const persisted = savedId !== null && isPersisted(savedId);
  const notice = savedId && !error ? submissionNotice({ kind: "newsletter", persisted }) : null;

  return (
    <div className={className}>
      <form
        noValidate
        aria-label={formLabel}
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="relative flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...register("email", {
            onChange: () => {
              setSavedId(null);
              setRetryNeeded(false);
            },
          })}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-md border px-3.5 text-sm transition-colors",
            dark
              ? "border-white/15 bg-white/5 text-white placeholder:text-white/55 hover:border-white/30 focus-visible:border-white/50"
              : "border-line-strong bg-surface text-ink placeholder:text-subtle hover:border-muted/60 focus-visible:border-blue",
            fieldError && (dark ? "border-danger-light" : "border-danger"),
          )}
        />
        <HoneypotInput id={`${id}-x`} registration={register(HONEYPOT_FIELD)} />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex h-11 shrink-0 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:opacity-60",
            dark ? "bg-blue text-white hover:bg-blue-ink" : "bg-navy text-white hover:bg-navy-soft",
          )}
        >
          Subscribe
        </button>
      </form>

      {error && (
        <p
          id={errorId}
          role={fieldError ? undefined : "alert"}
          className={cn("mt-2 text-[0.8125rem]", dark ? "text-danger-light" : "text-danger")}
        >
          {error}
        </p>
      )}

      <div aria-live="polite">
        {notice && (
          <p
            className={cn(
              "mt-3 flex items-start gap-2 text-[0.8125rem] leading-5",
              dark ? "text-white/80" : "text-subtle",
            )}
          >
            {persisted ? (
              <CircleCheck
                aria-hidden="true"
                className={cn("mt-0.5 size-4 shrink-0", dark ? "text-blue-light" : "text-success")}
                strokeWidth={2}
              />
            ) : (
              <TriangleAlert
                aria-hidden="true"
                className={cn("mt-0.5 size-4 shrink-0", dark ? "text-danger-light" : "text-danger")}
                strokeWidth={2}
              />
            )}
            <span>
              <span className={cn("font-medium", dark ? "text-white" : "text-ink")}>{notice.title}.</span>{" "}
              {notice.body}
              {notice.showStorageNotice && <> {SUBMISSION_NOTICE}</>}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
