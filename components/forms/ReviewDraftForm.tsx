"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Star, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldErrors, type Path } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { useMounted } from "@/lib/hooks/useMounted";
import { draftNotice } from "@/lib/reviews/draft-notice";
import { companySizeLabel } from "@/lib/directory/labels";
import {
  SUBMISSION_NOTICE,
  isPersisted,
  listSubmissions,
  removeSubmissionsWhere,
  saveSubmission,
  type Submission,
} from "@/lib/submissions";
import { cn } from "@/lib/utils";
import {
  COMPANY_SIZE_VALUES,
  HONEYPOT_ERROR,
  HONEYPOT_FIELD,
  REVIEW_EXPERIENCE_MAX,
  REVIEW_EXPERIENCE_MIN,
  USAGE_LENGTH_OPTIONS,
  isHoneypotOnly,
  reviewDraftSchema,
  type ReviewDraftInput,
  type ReviewDraftValues,
} from "@/lib/validation";

export interface ReviewDraftFormProps {
  product: { slug: string; name: string };
  /** Industry names offered as suggestions; the field also accepts free text. */
  industries: string[];
  className?: string;
}

type RatingKey = "overall" | "ease" | "value" | "features" | "support";

const RATINGS: { key: RatingKey; label: string; hint: string }[] = [
  { key: "overall", label: "Overall rating", hint: "Your overall impression of the product." },
  { key: "ease", label: "Ease of use", hint: "How easy it is to learn and use every day." },
  { key: "value", label: "Value for money", hint: "Whether what you get is worth what you pay." },
  { key: "features", label: "Features", hint: "How well its features cover what you need." },
  { key: "support", label: "Customer support", hint: "How helpful and quick the vendor's support is." },
];

/** Field order on the page, used to order the error summary. */
const FIELD_ORDER: Path<ReviewDraftInput>[] = [
  "overall",
  "ease",
  "value",
  "features",
  "support",
  "headline",
  "pros",
  "cons",
  "experience",
  "usageLength",
  "jobTitle",
  "companySize",
  "industry",
];

const FIELD_LABEL: Record<string, string> = {
  overall: "Overall rating",
  ease: "Ease of use",
  value: "Value for money",
  features: "Features",
  support: "Customer support",
  headline: "Headline",
  pros: "What you liked",
  cons: "What could be better",
  experience: "Your experience",
  usageLength: "How long you have used it",
  jobTitle: "Job title",
  companySize: "Company size",
  industry: "Industry",
};

const EMPTY_VALUES: ReviewDraftInput = {
  // Ratings start unset: a missing rating is an error, never an implied one.
  overall: undefined as unknown as number,
  ease: undefined as unknown as number,
  value: undefined as unknown as number,
  features: undefined as unknown as number,
  support: undefined as unknown as number,
  headline: "",
  pros: "",
  cons: "",
  experience: "",
  usageLength: "" as ReviewDraftInput["usageLength"],
  jobTitle: "",
  companySize: "" as ReviewDraftInput["companySize"],
  industry: "",
  [HONEYPOT_FIELD]: "",
};

interface StoredDraft {
  id: string;
  savedAt: string;
  values: ReviewDraftValues;
}

/** The newest valid draft for this product in storage, or null. */
function findDraft(slug: string): StoredDraft | null {
  const drafts = listSubmissions("review-draft").filter((entry: Submission) => entry.payload.product === slug);
  for (const entry of drafts.reverse()) {
    const parsed = reviewDraftSchema.safeParse(entry.payload);
    if (parsed.success) return { id: entry.id, savedAt: entry.createdAt, values: parsed.data };
  }
  return null;
}

const inputClass =
  "block w-full rounded-md border border-line-strong bg-surface px-3.5 text-sm text-ink placeholder:text-subtle hover:border-muted/60 focus-visible:border-blue aria-[invalid=true]:border-danger";

/**
 * Review draft form. Validates with `reviewDraftSchema` and stores the draft
 * locally via `saveSubmission('review-draft', ...)`. Nothing is sent or
 * published: review collection is not open, and the confirmation says so.
 * Saves only on submit (no autosave). One draft is kept per product; a saved
 * draft is offered back on return with "Edit draft" and "Clear draft".
 */
export function ReviewDraftForm({ product, industries, className }: ReviewDraftFormProps) {
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;
  const errorId = (name: string) => `${id}-${name}-error`;
  const mounted = useMounted();
  // Set after a save or clear; until then the draft found in storage is used.
  const [latest, setLatest] = useState<{ draft: StoredDraft | null } | null>(null);
  const [editing, setEditing] = useState(false);
  // Set when the hidden field was filled: a neutral error is shown and the next attempt is a plain retry.
  const [retryNeeded, setRetryNeeded] = useState(false);
  const [cleared, setCleared] = useState<"idle" | "cleared" | "failed">("idle");
  // True once the visitor has saved, edited or cleared, so focus follows those actions and never moves on page load.
  const [interacted, setInteracted] = useState(false);
  const noticeRef = useRef<HTMLHeadingElement>(null);

  // Storage is read only after hydration, so the server and first client render agree.
  const found = useMemo(() => (mounted ? findDraft(product.slug) : null), [mounted, product.slug]);
  const stored = latest ? latest.draft : found;
  const showNotice = stored !== null && !editing;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<ReviewDraftInput, unknown, ReviewDraftValues>({
    resolver: zodResolver(reviewDraftSchema),
    defaultValues: EMPTY_VALUES,
    // Focus is moved by `focusField` below: react-hook-form cannot focus a group of radios reliably.
    shouldFocusError: false,
  });

  /** Moves focus to a field by name (the first star for a rating group). */
  const focusField = (name: string) => document.getElementById(fieldId(name))?.focus();

  useEffect(() => {
    if (!interacted) return;
    if (showNotice) noticeRef.current?.focus();
    else document.getElementById(`${id}-overall`)?.focus();
  }, [interacted, showNotice, id]);

  const onSubmit = (values: ReviewDraftValues) => {
    const draft: Partial<ReviewDraftValues> = { ...values };
    delete draft[HONEYPOT_FIELD];
    // One draft per product: the new save replaces the earlier one, but only
    // once it has really been stored (the earlier draft is kept otherwise).
    saveSubmission(
      "review-draft",
      { ...draft, product: product.slug, productName: product.name, status: "draft" },
      { replaceWhere: (entry) => entry.payload.product === product.slug },
    );
    setCleared("idle");
    setRetryNeeded(false);
    setEditing(false);
    setLatest({ draft: findDraft(product.slug) });
    setInteracted(true);
  };

  const onInvalid = (invalid: FieldErrors<ReviewDraftInput>) => {
    const first = FIELD_ORDER.find((name) => invalid[name]);
    if (first) {
      setRetryNeeded(false);
      focusField(first);
      return;
    }
    if (isHoneypotOnly(invalid)) {
      // The hidden field was filled (a bot, or browser autofill). Nothing is
      // stored and success is not claimed: show a neutral error and clear the
      // field so the visitor's next attempt goes through.
      setValue(HONEYPOT_FIELD, "");
      setRetryNeeded(true);
    }
  };

  const editDraft = () => {
    if (!stored) return;
    reset({ ...stored.values, [HONEYPOT_FIELD]: "" });
    setEditing(true);
    setInteracted(true);
  };

  const clearDraft = () => {
    // Every draft for this product, stored or in memory (an earlier one can
    // survive a failed replace); success is reported only if none remain.
    const removed = removeSubmissionsWhere("review-draft", (entry) => entry.payload.product === product.slug);
    reset(EMPTY_VALUES);
    setEditing(false);
    setCleared(removed ? "cleared" : "failed");
    setLatest({ draft: null });
    setInteracted(true);
  };

  const summaryItems = FIELD_ORDER.filter((name) => errors[name]).map((name) => ({
    name,
    message: errors[name]?.message ?? "Check this field.",
  }));
  const showSummary = isSubmitted && summaryItems.length > 0;
  // Read from storage, not remembered: the draft is only "saved" if it is really stored.
  const persisted = stored ? isPersisted(stored.id) : true;

  const experience = useWatch({ control, name: "experience" });
  const ratingValues = useWatch({ control, name: RATINGS.map((rating) => rating.key) });
  const experienceLength = (experience ?? "").trim().length;

  if (showNotice && stored) {
    const notice = draftNotice({ persisted, productName: product.name, headline: stored.values.headline });
    return (
      <div className={className}>
        <div className="rounded-lg border border-line bg-surface-alt p-5 sm:p-6">
          <div className="flex items-start gap-3">
            {persisted ? (
              <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" strokeWidth={2} />
            ) : (
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" strokeWidth={2} />
            )}
            <div className="min-w-0">
              <h2 ref={noticeRef} tabIndex={-1} className="type-h3 text-navy outline-none">
                {notice.title}
              </h2>
              <p className="type-body mt-2 text-ink">{notice.body}</p>
              {notice.showStorageNotice && <p className="type-meta mt-2">{SUBMISSION_NOTICE}</p>}
              {notice.showSavedLine && (
                <p className="type-meta mt-1">
                  Saved {new Date(stored.savedAt).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}.
                  Clearing your browser data or using another device will remove or hide it.
                </p>
              )}
              {cleared === "failed" && (
                <p role="alert" className="mt-3 text-sm text-danger">
                  We couldn&rsquo;t remove the draft from this browser&rsquo;s storage. Clear this site&rsquo;s data in
                  your browser settings to delete it.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={editDraft}>
                  Edit draft
                </Button>
                <Button variant="ghost" onClick={clearDraft}>
                  Clear draft
                </Button>
                <Button href={`/products/${product.slug}`} variant="link">
                  Back to {product.name}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-label={`Review draft for ${product.name}`}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={cn("relative space-y-10", className)}
    >
      <div aria-live="polite">
        {cleared === "cleared" && (
          <p className="flex items-center gap-2 rounded-md border border-line bg-surface-alt px-4 py-3 text-sm text-ink">
            <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-success" strokeWidth={2} />
            Draft cleared from this browser.
          </p>
        )}
        {cleared === "failed" && (
          <p className="rounded-md border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
            We couldn&rsquo;t remove the earlier draft from this browser&rsquo;s storage; it may still be stored.
          </p>
        )}
      </div>

      <div role="alert">
        {retryNeeded && !showSummary && (
          <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger-tint p-4 text-sm font-semibold text-danger sm:p-5">
            <TriangleAlert aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
            {HONEYPOT_ERROR}
          </p>
        )}
        {showSummary && (
          <div className="rounded-lg border border-danger/30 bg-danger-tint p-4 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-danger">
              <TriangleAlert aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
              {`Please fix ${summaryItems.length} ${summaryItems.length === 1 ? "field" : "fields"} before saving your draft.`}
            </p>
            {summaryItems.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-9 text-sm text-ink">
                {summaryItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={`#${fieldId(item.name)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        focusField(item.name);
                      }}
                      className="rounded-xs underline underline-offset-2 hover:text-navy"
                    >
                      {FIELD_LABEL[item.name]}
                    </a>
                    : {item.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <fieldset className="min-w-0 space-y-7">
        <legend className="type-h3 mb-3 text-navy">Your ratings</legend>
        <p id={`${id}-ratings-help`} className="type-meta">
          Choose 1 (poor) to 5 (excellent) for each. All five are required.
        </p>
        {RATINGS.map((rating, index) => (
          <RatingGroup
            key={rating.key}
            name={rating.key}
            label={rating.label}
            hint={rating.hint}
            baseId={fieldId(rating.key)}
            errorId={errorId(rating.key)}
            value={ratingValues[index]}
            error={errors[rating.key]?.message}
            onChoose={(n) => setValue(rating.key, n, { shouldValidate: isSubmitted, shouldDirty: true })}
          />
        ))}
      </fieldset>

      <fieldset className="min-w-0 space-y-6">
        <legend className="type-h3 mb-3 text-navy">Your review</legend>

        <Field
          id={fieldId("headline")}
          label="Headline"
          hint="A short summary, 5 to 120 characters."
          error={errors.headline?.message}
          errorId={errorId("headline")}
        >
          <input
            id={fieldId("headline")}
            type="text"
            autoComplete="off"
            aria-invalid={errors.headline ? true : undefined}
            aria-describedby={describedBy(`${fieldId("headline")}-hint`, errors.headline && errorId("headline"))}
            {...register("headline")}
            className={cn(inputClass, "h-11")}
          />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            id={fieldId("pros")}
            label="What you liked"
            hint="The main strengths, in your own words."
            error={errors.pros?.message}
            errorId={errorId("pros")}
          >
            <textarea
              id={fieldId("pros")}
              rows={4}
              aria-invalid={errors.pros ? true : undefined}
              aria-describedby={describedBy(`${fieldId("pros")}-hint`, errors.pros && errorId("pros"))}
              {...register("pros")}
              className={cn(inputClass, "py-2.5 leading-6")}
            />
          </Field>
          <Field
            id={fieldId("cons")}
            label="What could be better"
            hint="Limits, gaps or frustrations."
            error={errors.cons?.message}
            errorId={errorId("cons")}
          >
            <textarea
              id={fieldId("cons")}
              rows={4}
              aria-invalid={errors.cons ? true : undefined}
              aria-describedby={describedBy(`${fieldId("cons")}-hint`, errors.cons && errorId("cons"))}
              {...register("cons")}
              className={cn(inputClass, "py-2.5 leading-6")}
            />
          </Field>
        </div>

        <Field
          id={fieldId("experience")}
          label="Your experience"
          hint={`What you used it for, how it went and what you would tell a buyer. At least ${REVIEW_EXPERIENCE_MIN} characters.`}
          error={errors.experience?.message}
          errorId={errorId("experience")}
        >
          <textarea
            id={fieldId("experience")}
            rows={7}
            aria-invalid={errors.experience ? true : undefined}
            aria-describedby={describedBy(
              `${fieldId("experience")}-hint`,
              `${fieldId("experience")}-count`,
              errors.experience && errorId("experience"),
            )}
            {...register("experience")}
            className={cn(inputClass, "py-2.5 leading-6")}
          />
          <p
            id={`${fieldId("experience")}-count`}
            className={cn(
              "type-meta mt-1.5 tabular-nums",
              experienceLength > REVIEW_EXPERIENCE_MAX && "text-danger",
            )}
          >
            {experienceLength >= REVIEW_EXPERIENCE_MIN
              ? `${experienceLength} characters (minimum of ${REVIEW_EXPERIENCE_MIN} reached)`
              : `${experienceLength} of ${REVIEW_EXPERIENCE_MIN} characters minimum`}
            {experienceLength > REVIEW_EXPERIENCE_MAX && `; the limit is ${REVIEW_EXPERIENCE_MAX}`}
          </p>
        </Field>
      </fieldset>

      <fieldset className="min-w-0 space-y-6">
        <legend className="type-h3 mb-3 text-navy">About you</legend>
        <p className="type-meta">
          This context helps readers judge a review. It will not be published with your name.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            id={fieldId("usageLength")}
            label="How long you have used it"
            error={errors.usageLength?.message}
            errorId={errorId("usageLength")}
          >
            <select
              id={fieldId("usageLength")}
              aria-invalid={errors.usageLength ? true : undefined}
              aria-describedby={describedBy(errors.usageLength && errorId("usageLength"))}
              {...register("usageLength")}
              className={cn(inputClass, "h-11")}
            >
              <option value="">Choose one</option>
              {USAGE_LENGTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id={fieldId("jobTitle")}
            label="Job title"
            error={errors.jobTitle?.message}
            errorId={errorId("jobTitle")}
          >
            <input
              id={fieldId("jobTitle")}
              type="text"
              autoComplete="organization-title"
              aria-invalid={errors.jobTitle ? true : undefined}
              aria-describedby={describedBy(errors.jobTitle && errorId("jobTitle"))}
              {...register("jobTitle")}
              className={cn(inputClass, "h-11")}
            />
          </Field>
          <Field
            id={fieldId("companySize")}
            label="Company size"
            error={errors.companySize?.message}
            errorId={errorId("companySize")}
          >
            <select
              id={fieldId("companySize")}
              aria-invalid={errors.companySize ? true : undefined}
              aria-describedby={describedBy(errors.companySize && errorId("companySize"))}
              {...register("companySize")}
              className={cn(inputClass, "h-11")}
            >
              <option value="">Choose one</option>
              {COMPANY_SIZE_VALUES.map((size) => (
                <option key={size} value={size}>
                  {companySizeLabel[size]}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id={fieldId("industry")}
            label="Industry"
            hint="Pick a suggestion or type your own."
            error={errors.industry?.message}
            errorId={errorId("industry")}
          >
            <input
              id={fieldId("industry")}
              type="text"
              list={`${id}-industries`}
              autoComplete="off"
              aria-invalid={errors.industry ? true : undefined}
              aria-describedby={describedBy(`${fieldId("industry")}-hint`, errors.industry && errorId("industry"))}
              {...register("industry")}
              className={cn(inputClass, "h-11")}
            />
            <datalist id={`${id}-industries`}>
              {industries.map((name) => (
                <option key={name} value={name} />
              ))}
              <option value="Other" />
            </datalist>
          </Field>
        </div>
      </fieldset>

      {/* Honeypot: hidden from people and assistive technology; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input id={fieldId("x")} type="text" tabIndex={-1} autoComplete="off" {...register(HONEYPOT_FIELD)} />
      </div>

      <div className="border-t border-line pt-6">
        <p className="type-body max-w-2xl text-subtle">
          Saving stores this draft only in this browser. Review collection isn&rsquo;t open yet, so nothing is sent or
          published. See the{" "}
          <Link href="/review-guidelines" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
            review guidelines
          </Link>{" "}
          that will apply when it opens.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSubmitting} size="lg">
            Save draft
          </Button>
          <Button href={`/products/${product.slug}`} variant="ghost" size="lg">
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Joins the ids that describe a control, skipping empty ones. */
function describedBy(...ids: (string | false | undefined | null)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined === "" ? undefined : joined;
}

function Field({
  id,
  label,
  hint,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label}
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

/**
 * One 1 to 5 rating as a native radio group (arrow keys move between stars,
 * Tab enters and leaves the group). Stars up to the chosen one are filled and
 * the choice is also written out ("4 of 5") so it never relies on colour.
 */
function RatingGroup({
  name,
  label,
  hint,
  baseId,
  errorId,
  value,
  error,
  onChoose,
}: {
  name: RatingKey;
  label: string;
  hint: string;
  baseId: string;
  errorId: string;
  value: unknown;
  error?: string;
  /** Called with the chosen number; the form stores it as a number (react-hook-form would hand back the radio's string). */
  onChoose: (n: number) => void;
}) {
  const chosen = typeof value === "number" && Number.isInteger(value) ? value : 0;
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${baseId}-label`}
      aria-describedby={describedBy(`${baseId}-hint`, error && errorId)}
      aria-invalid={error ? true : undefined}
      className="grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div>
        <p id={`${baseId}-label`} className="text-sm font-medium text-navy">
          {label}
        </p>
        <p id={`${baseId}-hint`} className="type-meta">
          {hint}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-blue"
            >
              <input
                type="radio"
                value={n}
                id={n === 1 ? baseId : undefined}
                className="peer absolute inset-0 size-full cursor-pointer opacity-0"
                aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${label}`}
                name={name}
                aria-describedby={error ? errorId : undefined}
                checked={chosen === n}
                onChange={() => onChoose(n)}
              />
              <Star
                aria-hidden="true"
                strokeWidth={1.75}
                className={cn(
                  "size-6 transition-colors",
                  n <= chosen ? "fill-navy text-navy" : "fill-transparent text-muted peer-hover:text-navy",
                )}
              />
            </label>
          ))}
        </div>
        <span className="type-meta w-16 tabular-nums" aria-hidden="true">
          {chosen > 0 ? `${chosen} of 5` : "Not rated"}
        </span>
      </div>
      {error && (
        <p id={errorId} className="text-[0.8125rem] text-danger sm:col-span-2">
          {error}
        </p>
      )}
    </div>
  );
}
