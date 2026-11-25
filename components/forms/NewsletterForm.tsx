"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { SUBMISSION_NOTICE, saveSubmission } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import { newsletterSchema, type NewsletterInput, type NewsletterValues } from "@/lib/validation";

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
 * confirmation says so.
 */
export function NewsletterForm({ tone = "light", source = "unknown", className }: NewsletterFormProps) {
  const dark = tone === "dark";
  const id = useId();
  const inputId = `${id}-email`;
  const errorId = `${id}-error`;
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput, unknown, NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: NewsletterValues) => {
    saveSubmission("newsletter", { email: values.email, source });
    setSavedEmail(values.email);
    reset();
  };

  const error = errors.email?.message;

  return (
    <div className={className}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...register("email", { onChange: () => setSavedEmail(null) })}
          className={cn(
            "h-11 min-w-0 flex-1 rounded-md border px-3.5 text-sm transition-colors",
            dark
              ? "border-white/15 bg-white/5 text-white placeholder:text-white/55 hover:border-white/30 focus-visible:border-white/50"
              : "border-line-strong bg-surface text-ink placeholder:text-subtle hover:border-muted/60 focus-visible:border-blue",
            error && (dark ? "border-danger-light" : "border-danger"),
          )}
        />
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
        <p id={errorId} className={cn("mt-2 text-[0.8125rem]", dark ? "text-danger-light" : "text-danger")}>
          {error}
        </p>
      )}

      <div aria-live="polite">
        {savedEmail && !error && (
          <p
            className={cn(
              "mt-3 flex items-start gap-2 text-[0.8125rem] leading-5",
              dark ? "text-white/80" : "text-subtle",
            )}
          >
            <CircleCheck
              aria-hidden="true"
              className={cn("mt-0.5 size-4 shrink-0", dark ? "text-blue-light" : "text-success")}
              strokeWidth={2}
            />
            <span>
              <span className={cn("font-medium", dark ? "text-white" : "text-ink")}>
                Thanks, we saved {savedEmail}.
              </span>{" "}
              {SUBMISSION_NOTICE}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
