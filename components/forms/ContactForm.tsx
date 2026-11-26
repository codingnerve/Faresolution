"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
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
import { ProductPrefill } from "@/components/forms/ProductPrefill";
import { Button } from "@/components/ui/Button";
import { submissionNotice } from "@/lib/forms/submission-notice";
import { saveSubmission } from "@/lib/submissions";
import { cn } from "@/lib/utils";
import {
  CONTACT_TOPIC_OPTIONS,
  HONEYPOT_ERROR,
  HONEYPOT_FIELD,
  contactSchema,
  isHoneypotOnly,
  type ContactInput,
  type ContactTopic,
  type ContactValues,
} from "@/lib/validation";

const FIELD_ORDER: Path<ContactInput>[] = ["name", "email", "topic", "product", "message"];

const FIELD_LABEL: Record<string, string> = {
  name: "Your name",
  email: "Email address",
  topic: "What it's about",
  product: "Product",
  message: "Message",
};

/** Guidance under the topic field; honest about what happens to each kind of message. */
const TOPIC_HINT: Record<ContactTopic, string> = {
  general: "Questions about the directory, how it works or something on the site.",
  demo: "Requests aren't passed to vendors yet. For a demo today, use the vendor's own website, linked from its profile.",
  correction: "Say which fact is wrong and where the correct information is published.",
  vendor: "The vendor programme opens at launch. You can also register interest or prepare a listing claim.",
  editorial: "Story ideas, research questions, press and partnership enquiries.",
  privacy: "This demo keeps no data about you on a server; see the privacy notice for what your browser stores.",
};

const EMPTY_VALUES: ContactInput = {
  name: "",
  email: "",
  topic: "general",
  product: "",
  message: "",
  [HONEYPOT_FIELD]: "",
};

interface Result {
  persisted: boolean;
  productName: string | null;
}

/**
 * Contact form. Validates with `contactSchema` and stores the message
 * locally via `saveSubmission('contact', ...)`: the demo is not connected to
 * email, so nothing is sent and the confirmation says so. A product's
 * "Request demo" button links here with `?product=<slug>`, which is read on
 * the client (the page is static), validated and used to preselect the
 * product and the demo topic.
 */
export function ContactForm({ className }: { className?: string }) {
  const id = useId();
  const fieldId = (name: string) => `${id}-${name}`;
  const errorId = (name: string) => `${id}-${name}-error`;
  const lookup = useProductLookup();
  const products = useMemo(
    () => [...lookup.values()].sort((a, b) => a.name.localeCompare(b.name, "en")),
    [lookup],
  );
  const [result, setResult] = useState<Result | null>(null);
  const [retryNeeded, setRetryNeeded] = useState(false);
  const [prefilled, setPrefilled] = useState<string | null>(null);
  // Focus follows submit and "Write another" only, never page load.
  const [interacted, setInteracted] = useState(false);
  const noticeRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_VALUES,
    // Focus is moved by onInvalid, in page order, as in the other forms.
    shouldFocusError: false,
  });

  const applyPrefill = useCallback(
    (slug: string) => {
      setPrefilled(slug);
      setValue("product", slug);
      setValue("topic", "demo");
    },
    [setValue],
  );

  useEffect(() => {
    if (!interacted) return;
    if (result) noticeRef.current?.focus();
    else document.getElementById(`${id}-name`)?.focus();
  }, [interacted, result, id]);

  const onSubmit = (values: ContactValues) => {
    const entry: Partial<ContactValues> = { ...values };
    delete entry[HONEYPOT_FIELD];
    const productName = values.product ? (lookup.get(values.product)?.name ?? null) : null;
    const saved = saveSubmission("contact", { ...entry, productName });
    setRetryNeeded(false);
    setResult({ persisted: saved.persisted, productName });
    setInteracted(true);
  };

  const onInvalid = (invalid: FieldErrors<ContactInput>) => {
    const first = FIELD_ORDER.find((name) => invalid[name]);
    if (first) {
      setRetryNeeded(false);
      document.getElementById(fieldId(first))?.focus();
      return;
    }
    if (isHoneypotOnly(invalid)) {
      // Nothing is stored and success is not claimed; the next attempt is a plain retry.
      setValue(HONEYPOT_FIELD, "");
      setRetryNeeded(true);
    }
  };

  const startAgain = () => {
    reset(prefilled ? { ...EMPTY_VALUES, product: prefilled, topic: "demo" } : EMPTY_VALUES);
    setResult(null);
    setInteracted(true);
  };

  const topic = useWatch({ control, name: "topic" }) ?? "general";
  const productSlug = useWatch({ control, name: "product" });
  const selectedName = productSlug ? lookup.get(productSlug)?.name : undefined;

  const summaryItems = FIELD_ORDER.filter((name) => errors[name]).map((name) => ({
    name,
    label: FIELD_LABEL[name],
    message: errors[name]?.message ?? "Check this field.",
  }));
  const showSummary = isSubmitted && summaryItems.length > 0;

  if (result) {
    const notice = submissionNotice({ kind: "contact", persisted: result.persisted, productName: result.productName });
    return (
      <div className={className}>
        <SubmissionResult {...notice} persisted={result.persisted} headingRef={noticeRef}>
          <Button variant="secondary" onClick={startAgain}>
            Write another message
          </Button>
          <Button href="/software" variant="ghost">
            Browse software
          </Button>
        </SubmissionResult>
      </div>
    );
  }

  return (
    <form
      noValidate
      aria-label="Contact Faresolution"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className={cn("relative space-y-6", className)}
    >
      <Suspense fallback={null}>
        <ProductPrefill onResolve={applyPrefill} />
      </Suspense>

      <FormAlert
        showSummary={showSummary}
        items={summaryItems}
        summaryTitle={(count) => fixFieldsTitle(count, "saving your message")}
        retryMessage={retryNeeded ? HONEYPOT_ERROR : null}
        fieldHref={(name) => `#${fieldId(name)}`}
        onJump={(name) => document.getElementById(fieldId(name))?.focus()}
      />

      {prefilled && selectedName && productSlug === prefilled && (
        <p className="rounded-md border border-line bg-surface-alt px-4 py-3 text-sm text-ink">
          You came here from <span className="font-medium text-navy">{selectedName}</span>&rsquo;s &ldquo;Request
          demo&rdquo; button, so it is preselected below. Change it or clear it if you meant something else.
        </p>
      )}

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
        <Field id={fieldId("email")} label="Email address" error={errors.email?.message} errorId={errorId("email")}>
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field id={fieldId("topic")} label="What it's about" error={errors.topic?.message} errorId={errorId("topic")}>
          <select
            id={fieldId("topic")}
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={describedBy(`${fieldId("topic")}-guidance`, errors.topic && errorId("topic"))}
            {...register("topic")}
            className={cn(inputClass, "h-11")}
          >
            {CONTACT_TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id={`${fieldId("topic")}-guidance`} className="type-meta mt-1.5">
            {TOPIC_HINT[topic as ContactTopic] ?? TOPIC_HINT.general}
          </p>
        </Field>
        <Field
          id={fieldId("product")}
          label="Product"
          optional
          error={errors.product?.message}
          errorId={errorId("product")}
        >
          <select
            id={fieldId("product")}
            aria-invalid={errors.product ? true : undefined}
            aria-describedby={describedBy(`${fieldId("product")}-guidance`, errors.product && errorId("product"))}
            {...register("product")}
            className={cn(inputClass, "h-11")}
          >
            <option value="">No particular product</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
          <p id={`${fieldId("product")}-guidance`} className="type-meta mt-1.5">
            If your message is about one listing, choose it here.
          </p>
        </Field>
      </div>

      <Field
        id={fieldId("message")}
        label="Message"
        hint="At least 10 characters."
        error={errors.message?.message}
        errorId={errorId("message")}
      >
        <textarea
          id={fieldId("message")}
          rows={7}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy(`${fieldId("message")}-hint`, errors.message && errorId("message"))}
          {...register("message")}
          className={cn(inputClass, "py-2.5 leading-6")}
        />
      </Field>

      <HoneypotInput id={fieldId("x")} registration={register(HONEYPOT_FIELD)} />

      <div className="border-t border-line pt-6">
        <p className="type-body max-w-2xl text-subtle">
          This demo isn&rsquo;t connected to email yet, so your message stays in this browser and nobody receives it.
          See the{" "}
          <Link href="/privacy" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
            privacy notice
          </Link>{" "}
          for what is stored.
        </p>
        <div className="mt-5">
          <Button type="submit" disabled={isSubmitting} size="lg">
            Save message
          </Button>
        </div>
      </div>
    </form>
  );
}
