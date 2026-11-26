"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch, type FieldErrors, type Path } from "react-hook-form";
import { useProductLookup } from "@/components/compare/useProductLookup";
import {
  Field,
  FormAlert,
  HoneypotInput,
  SubmissionResult,
  describedBy,
  fixFieldsTitle,
  inputClass,
} from "@/components/forms/fields";
import { ProductPicker } from "@/components/forms/ProductPicker";
import { ProductPrefill } from "@/components/forms/ProductPrefill";
import { Button } from "@/components/ui/Button";
import { submissionNotice } from "@/lib/forms/submission-notice";
import { isFreeWebmail } from "@/lib/forms/webmail";
import { saveSubmission } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import {
  FORM_RETRY_ERROR,
  HONEYPOT_FIELD,
  claimSchema,
  isHoneypotOnly,
  type ClaimInput,
  type ClaimValues,
} from "@/lib/validation";

const FIELD_ORDER: Path<ClaimInput>[] = ["product", "name", "email", "company", "role", "note"];

const FIELD_LABEL: Record<string, string> = {
  product: "Product you represent",
  name: "Your name",
  email: "Work email",
  company: "Company",
  role: "Your role",
  note: "Note",
};

const EMPTY_VALUES: ClaimInput = {
  product: "",
  name: "",
  email: "",
  company: "",
  role: "",
  note: "",
  [HONEYPOT_FIELD]: "",
};

interface Result {
  persisted: boolean;
  productName: string | null;
}

/**
 * Listing claim request. Validates with `claimSchema` and stores the request
 * locally via `saveSubmission('claim', ...)`. Claims open at launch, so
 * nothing is sent, reviewed or verified, and the confirmation says so. A
 * personal webmail address is allowed; a soft hint explains that a company
 * address will make verification quicker. `?product=<slug>` preselects a
 * product (read on the client and validated).
 */
export function ClaimListingForm({ className }: { className?: string }) {
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;
  const errorId = (name: string) => `${id}-${name}-error`;
  const lookup = useProductLookup();
  const [result, setResult] = useState<Result | null>(null);
  const [retryNeeded, setRetryNeeded] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const noticeRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<ClaimInput, unknown, ClaimValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: EMPTY_VALUES,
    // The product picker is not a single registered input: focus is moved below.
    shouldFocusError: false,
  });

  useEffect(() => {
    if (!interacted) return;
    if (result) noticeRef.current?.focus();
    else document.getElementById(`${id}-product`)?.focus();
  }, [interacted, result, id]);

  const product = useWatch({ control, name: "product" }) ?? "";
  const email = useWatch({ control, name: "email" }) ?? "";
  const webmail = isFreeWebmail(email);

  const chooseProduct = (slug: string) =>
    setValue("product", slug, { shouldValidate: isSubmitted, shouldDirty: true });
  // Stable, so the prefill runs once per `?product=` value and never overrides a later choice.
  const applyPrefill = useCallback((slug: string) => setValue("product", slug), [setValue]);

  const onSubmit = (values: ClaimValues) => {
    const entry: Partial<ClaimValues> = { ...values };
    delete entry[HONEYPOT_FIELD];
    const productName = lookup.get(values.product)?.name ?? null;
    const saved = saveSubmission("claim", { ...entry, productName, webmail: isFreeWebmail(values.email), status: "pending-launch" });
    setRetryNeeded(false);
    setResult({ persisted: saved.persisted, productName });
    setInteracted(true);
  };

  const onInvalid = (invalid: FieldErrors<ClaimInput>) => {
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
    const notice = submissionNotice({ kind: "claim", persisted: result.persisted, productName: result.productName });
    return (
      <div className={className}>
        <SubmissionResult {...notice} persisted={result.persisted} headingRef={noticeRef}>
          <Button variant="secondary" onClick={startAgain}>
            Start another claim
          </Button>
          <Button href="/vendors/resources" variant="ghost">
            Prepare your listing
          </Button>
        </SubmissionResult>
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-label="Listing claim request"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={cn("relative space-y-6", className)}
    >
      <Suspense fallback={null}>
        <ProductPrefill onResolve={applyPrefill} />
      </Suspense>

      <FormAlert
        showSummary={showSummary}
        items={summaryItems}
        summaryTitle={(count) => fixFieldsTitle(count, "saving your claim request")}
        retryMessage={retryNeeded ? FORM_RETRY_ERROR : null}
        fieldHref={(name) => `#${fieldId(name)}`}
        onJump={(name) => document.getElementById(fieldId(name))?.focus()}
      />

      <ProductPicker
        inputId={fieldId("product")}
        label="Product you represent"
        value={product}
        onChange={chooseProduct}
        error={errors.product?.message}
        errorId={errorId("product")}
        hint="Type the product or your company's name, then choose it from the list."
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
        <Field
          id={fieldId("email")}
          label="Work email"
          hint="Ideally at your company's domain."
          error={errors.email?.message}
          errorId={errorId("email")}
        >
          <input
            id={fieldId("email")}
            type="email"
            autoComplete="email"
            spellCheck={false}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy(
              `${fieldId("email")}-hint`,
              webmail && `${fieldId("email")}-webmail`,
              errors.email && errorId("email"),
            )}
            {...register("email")}
            className={cn(inputClass, "h-11")}
          />
          <div aria-live="polite">
            {webmail && !errors.email && (
              <p
                id={`${fieldId("email")}-webmail`}
                className="mt-2 flex items-start gap-2 rounded-md border border-blue/15 bg-blue-tint px-3 py-2 text-[0.8125rem] leading-5 text-ink"
              >
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-ink" strokeWidth={2} />
                <span>
                  That looks like a personal mailbox. You can still use it, but an address at your company&rsquo;s
                  domain will make verification quicker when claims open at launch.
                </span>
              </p>
            )}
          </div>
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
        <Field id={fieldId("role")} label="Your role" error={errors.role?.message} errorId={errorId("role")}>
          <input
            id={fieldId("role")}
            type="text"
            autoComplete="organization-title"
            aria-invalid={errors.role ? true : undefined}
            aria-describedby={describedBy(errors.role && errorId("role"))}
            {...register("role")}
            className={cn(inputClass, "h-11")}
          />
        </Field>
      </div>

      <Field
        id={fieldId("note")}
        label="Note"
        optional
        hint="Anything that will help confirm you represent the product, or facts on the listing you want corrected. Up to 1000 characters."
        error={errors.note?.message}
        errorId={errorId("note")}
      >
        <textarea
          id={fieldId("note")}
          rows={5}
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={describedBy(`${fieldId("note")}-hint`, errors.note && errorId("note"))}
          {...register("note")}
          className={cn(inputClass, "py-2.5 leading-6")}
        />
      </Field>

      <HoneypotInput id={fieldId("x")} registration={register(HONEYPOT_FIELD)} />

      <div className="border-t border-line pt-6">
        <p className="type-body max-w-2xl text-subtle">
          Listing claims open at launch. Saving keeps this request only in this browser: nothing is sent, nobody
          reviews it and the listing does not change. Read{" "}
          <Link
            href="/vendors/resources"
            className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy"
          >
            how to prepare a listing
          </Link>{" "}
          in the meantime.
        </p>
        <div className="mt-5">
          <Button type="submit" disabled={isSubmitting} size="lg">
            Save claim request
          </Button>
        </div>
      </div>
    </form>
  );
}
