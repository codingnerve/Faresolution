/**
 * Zod schemas for every form on the site. Forms validate on the client with
 * these and store via `lib/submissions.ts`; a real API can reuse the same
 * schemas server side later. Task 11 adds the review, contact and claim schemas.
 */
import { z } from "zod";
import type { CompanySize } from "@/lib/data/types";

/** RFC 5321 caps a forward path at 254 characters. */
const MAX_EMAIL_LENGTH = 254;

/** A required, trimmed email address with friendly messages. */
export const emailField = z
  .string({ error: "Enter your email address." })
  .trim()
  .min(1, { error: "Enter your email address." })
  .max(MAX_EMAIL_LENGTH, { error: "That email address is too long." })
  .pipe(z.email({ error: "Enter a valid email address." }));

export const newsletterSchema = z.object({
  email: emailField,
});

export type NewsletterInput = z.input<typeof newsletterSchema>;
export type NewsletterValues = z.output<typeof newsletterSchema>;

// --- Shared building blocks -----------------------------------------------------

/**
 * A required, trimmed text field. Whitespace never counts toward `min`, and
 * a missing value gets the same message as an empty one.
 */
function textField(label: string, min: number, max: number, minHint?: string) {
  const required = `Enter ${label}.`;
  return z
    .string({ error: required })
    .trim()
    .min(1, { error: required, abort: true })
    .min(min, { error: minHint ?? `${capitalise(label)} must be at least ${min} characters.` })
    .max(max, { error: `${capitalise(label)} must be at most ${max} characters.` });
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A product or category slug: lower-case words joined by single hyphens. */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugField(error: string) {
  return z
    .string({ error })
    .trim()
    .min(1, { error })
    .max(100, { error })
    .regex(slugPattern, { error });
}

/**
 * Honeypot: a field real visitors never see or fill. Named `website` because
 * bots tend to fill it. Optional so a form that omits it still validates, but
 * any non-empty value is rejected.
 */
const honeypotField = z.string().max(0, { error: "Leave this field empty." }).optional();

// --- Review draft -----------------------------------------------------------------

/** One 1 to 5 star rating; a whole number only. */
function ratingField(label: string) {
  const message = `Choose a rating from 1 to 5 for ${label}.`;
  return z
    .number({ error: message })
    .int({ error: message })
    .min(1, { error: message })
    .max(5, { error: message });
}

/** Length of time the reviewer has used the product (stored value, label). */
export const USAGE_LENGTH_OPTIONS = [
  { value: "lt-1-month", label: "Less than 1 month" },
  { value: "1-6-months", label: "1 to 6 months" },
  { value: "6-12-months", label: "6 to 12 months" },
  { value: "1-2-years", label: "1 to 2 years" },
  { value: "gt-2-years", label: "More than 2 years" },
] as const;

export type UsageLength = (typeof USAGE_LENGTH_OPTIONS)[number]["value"];

/** Same values as `Product.companySizes` (`CompanySize` in lib/data/types.ts). */
export const COMPANY_SIZE_VALUES = ["solo", "small", "mid", "enterprise"] as const satisfies readonly CompanySize[];

const USAGE_LENGTH_VALUES = USAGE_LENGTH_OPTIONS.map((option) => option.value) as [UsageLength, ...UsageLength[]];

export const REVIEW_EXPERIENCE_MIN = 50;
export const REVIEW_EXPERIENCE_MAX = 5000;

/**
 * A review draft. Ratings are numbers (the form sets them from its star
 * groups), so "4", 3.5 and out-of-range values are rejected. `industry` is
 * free text (the form offers the catalogue's industries as suggestions plus
 * "Other"), so a reviewer in an industry we do not list is not blocked.
 */
export const reviewDraftSchema = z.object({
  overall: ratingField("your overall rating"),
  ease: ratingField("ease of use"),
  value: ratingField("value for money"),
  features: ratingField("features"),
  support: ratingField("customer support"),
  headline: textField("a headline", 5, 120, "The headline must be at least 5 characters."),
  pros: textField("what you liked", 3, 1000),
  cons: textField("what could be better", 3, 1000),
  experience: textField(
    "your experience",
    REVIEW_EXPERIENCE_MIN,
    REVIEW_EXPERIENCE_MAX,
    `Describe your experience in at least ${REVIEW_EXPERIENCE_MIN} characters.`,
  ),
  usageLength: z.enum(USAGE_LENGTH_VALUES, { error: "Choose how long you have used the product." }),
  jobTitle: textField("your job title", 2, 100),
  companySize: z.enum(COMPANY_SIZE_VALUES, { error: "Choose your company size." }),
  industry: textField("your industry", 2, 80),
  website: honeypotField,
});

export type ReviewDraftInput = z.input<typeof reviewDraftSchema>;
export type ReviewDraftValues = z.output<typeof reviewDraftSchema>;

// --- Contact ------------------------------------------------------------------------

/** An optional product slug; an empty choice means "none". */
const optionalProductField = z
  .union([z.literal("").transform(() => undefined), slugField("Choose a product from the list.")])
  .optional();

export const contactSchema = z.object({
  name: textField("your name", 2, 100),
  email: emailField,
  product: optionalProductField,
  message: textField("a message", 10, 5000, "Your message must be at least 10 characters."),
  website: honeypotField,
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactValues = z.output<typeof contactSchema>;

// --- Listing claim --------------------------------------------------------------------

export const claimSchema = z.object({
  product: slugField("Choose the product you represent."),
  name: textField("your name", 2, 100),
  email: emailField,
  company: textField("your company", 2, 120),
  role: textField("your role", 2, 100),
  note: z
    .string()
    .trim()
    .max(1000, { error: "The note must be at most 1000 characters." })
    .optional(),
  website: honeypotField,
});

export type ClaimInput = z.input<typeof claimSchema>;
export type ClaimValues = z.output<typeof claimSchema>;
