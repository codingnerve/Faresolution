"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, type FieldErrors, type Path } from "react-hook-form";
import {
  Field,
  FormAlert,
  HoneypotInput,
  SubmissionResult,
  describedBy,
  fixFieldsTitle,
  inputClass,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/Button";
import { VENDOR_PLANS } from "@/lib/data/content/plans";
import { submissionNotice } from "@/lib/forms/submission-notice";
import { saveSubmission } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import {
  HONEYPOT_ERROR,
  HONEYPOT_FIELD,
  isHoneypotOnly,
  vendorInterestSchema,
  type VendorInterestInput,
  type VendorInterestValues,
} from "@/lib/validation";

const FIELD_ORDER: Path<VendorInterestInput>[] = ["name", "email", "company", "website", "plan"];

const FIELD_LABEL: Record<string, string> = {
  name: "Your name",
  email: "Work email",
  company: "Company",
  website: "Company website",
  plan: "Plan you're interested in",
};

const PLAN_OPTIONS = [
  ...VENDOR_PLANS.map((plan) => ({ value: plan.id, label: plan.name, hint: plan.audience })),
  { value: "undecided", label: "Not sure yet", hint: "Tell us you're interested and decide when pricing is announced." },
] as const;

const EMPTY_VALUES: VendorInterestInput = {
  name: "",
  email: "",
  company: "",
  website: "",
  plan: "" as VendorInterestInput["plan"],
  [HONEYPOT_FIELD]: "",
};

/**
 * Vendor programme interest. Validates with
 * `vendorInterestSchema` and stores the entry locally via
 * `saveSubmission('vendor-interest', ...)`. No account is created and nothing
 * is sent; the confirmation says so.
 */
export function VendorInterestForm({
  source,
  className,
}: {
  /** Which page the form is on, stored with the entry (e.g. "pricing"). */
  source: string;
  className?: string;
}) {
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;
  const errorId = (name: string) => `${id}-${name}-error`;
  const [result, setResult] = useState<{ persisted: boolean } | null>(null);
  const [retryNeeded, setRetryNeeded] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const noticeRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<VendorInterestInput, unknown, VendorInterestValues>({
    resolver: zodResolver(vendorInterestSchema),
    defaultValues: EMPTY_VALUES,
    shouldFocusError: false,
  });

  useEffect(() => {
    if (!interacted) return;
    if (result) noticeRef.current?.focus();
    else document.getElementById(`${id}-name`)?.focus();
  }, [interacted, result, id]);

  const onSubmit = (values: VendorInterestValues) => {
    const entry: Partial<VendorInterestValues> = { ...values };
    delete entry[HONEYPOT_FIELD];
    const saved = saveSubmission("vendor-interest", { ...entry, source });
    setRetryNeeded(false);
    setResult({ persisted: saved.persisted });
    setInteracted(true);
  };

  const onInvalid = (invalid: FieldErrors<VendorInterestInput>) => {
    const first = FIELD_ORDER.find((name) => invalid[name]);
    if (first) {
      setRetryNeeded(false);
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    if (isHoneypotOnly(invalid)) {
      setValue(HONEYPOT_FIELD, "");
      setRetryNeeded(true);
    }
  };

  const startAgain = () => {
    reset(EMPTY_VALUES);
    setResult(null);
    setInteracted(true);
  };

  const summaryItems = FIELD_ORDER.filter((name) => errors[name]).map((name) => ({
    name,
    label: FIELD_LABEL[name],
    message: errors[name]?.message ?? "Check this field.",
  }));
  const showSummary = isSubmitted && summaryItems.length > 0;

  if (result) {
    const notice = submissionNotice({ kind: "vendor-interest", persisted: result.persisted });
    return (
      <div className={className}>
        <SubmissionResult {...notice} persisted={result.persisted} headingRef={noticeRef}>
          <Button variant="secondary" onClick={startAgain}>
            Start again
          </Button>
          <Button href="/vendors/claim-listing" variant="ghost">
            Prepare a listing claim
          </Button>
        </SubmissionResult>
      </div>
    );
  }

  const planError = errors.plan?.message;

  return (
    <form
      noValidate
      aria-label="Vendor programme interest"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={cn("relative space-y-6", className)}
    >
      <FormAlert
        showSummary={showSummary}
        items={summaryItems}
        summaryTitle={(count) => fixFieldsTitle(count, "saving your interest")}
        retryMessage={retryNeeded ? HONEYPOT_ERROR : null}
        fieldHref={(name) => `#${fieldId(name)}`}
        onJump={(name) => document.getElementById(fieldId(name))?.focus()}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Field id={fieldId("name")} label="Your name" error={errors.name?.message} errorId={errorId("name")}>
          <input
            id={fieldId("name")}
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy(errors.name && errorId("name"))}
            {...register("name")}
            className={cn(inputClass, "h-11")}
          />
        </Field>
        <Field id={fieldId("email")} label="Work email" error={errors.email?.message} errorId={errorId("email")}>
          <input
            id={fieldId("email")}
            type="email"
            autoComplete="email"
            spellCheck={false}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy(errors.email && errorId("email"))}
            {...register("email")}
            className={cn(inputClass, "h-11")}
          />
        </Field>
        <Field id={fieldId("company")} label="Company" error={errors.company?.message} errorId={errorId("company")}>
          <input
            id={fieldId("company")}
            type="text"
            autoComplete="organization"
            aria-invalid={errors.company ? true : undefined}
            aria-describedby={describedBy(errors.company && errorId("company"))}
            {...register("company")}
            className={cn(inputClass, "h-11")}
          />
        </Field>
        <Field
          id={fieldId("website")}
          label="Company website"
          optional
          hint="The full address, starting with https://"
          error={errors.website?.message}
          errorId={errorId("website")}
        >
          <input
            id={fieldId("website")}
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            placeholder="https://"
            aria-invalid={errors.website ? true : undefined}
            aria-describedby={describedBy(`${fieldId("website")}-hint`, errors.website && errorId("website"))}
            {...register("website")}
            className={cn(inputClass, "h-11")}
          />
        </Field>
      </div>

      <fieldset
        role="radiogroup"
        aria-labelledby={`${fieldId("plan")}-legend`}
        aria-describedby={describedBy(`${fieldId("plan")}-help`, planError && errorId("plan"))}
        aria-invalid={planError ? true : undefined}
        className="min-w-0"
      >
        <legend id={`${fieldId("plan")}-legend`} className="text-sm font-medium text-navy">Plan you&rsquo;re interested in</legend>
        <p id={`${fieldId("plan")}-help`} className="type-meta mt-0.5 mb-3">
          Nothing is reserved or charged; this only tells us what to plan for.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PLAN_OPTIONS.map((option, index) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-md border bg-surface p-3.5 transition-colors hover:border-muted/60 has-[:checked]:border-navy has-[:checked]:bg-surface-alt has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue",
                planError ? "border-danger" : "border-line-strong",
              )}
            >
              <input
                type="radio"
                value={option.value}
                id={index === 0 ? fieldId("plan") : undefined}
                aria-describedby={`${fieldId("plan")}-${option.value}-hint`}
                {...register("plan")}
                className="mt-0.5 size-4 shrink-0 accent-navy focus-visible:outline-none"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy">{option.label}</span>
                <span id={`${fieldId("plan")}-${option.value}-hint`} className="type-meta mt-0.5 block">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
        {planError && (
          <p id={errorId("plan")} className="mt-1.5 text-[0.8125rem] text-danger">
            {planError}
          </p>
        )}
      </fieldset>

      <HoneypotInput id={fieldId("x")} registration={register(HONEYPOT_FIELD)} />

      <div className="border-t border-line pt-6">
        <p className="type-body max-w-2xl text-subtle">
          Saving keeps your interest only in this browser. No account is created, nothing is sent and nobody will
          contact you from this demo.
        </p>
        <div className="mt-5">
          <Button type="submit" disabled={isSubmitting} size="lg">
            Save my interest
          </Button>
        </div>
      </div>
    </form>
  );
}
