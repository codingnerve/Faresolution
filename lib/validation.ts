/**
 * Zod schemas for every form on the site. Forms validate on the client with
 * these and store via `lib/submissions.ts`; a real API can reuse the same
 * schemas server side later. Task 11 adds the review, contact and claim
 * schemas; Task 14 adds contact topics and the vendor interest schema.
 */
import { z } from "zod";
import { PLAN_IDS, type PlanId } from "@/lib/data/content/plans";
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
 * Honeypot: a field real visitors never see or fill. Its key is deliberately
 * not a word like "website" or "url" that browser autofill treats as a real
 * field and fills for a human. Optional so a form that omits it still
 * validates, but any non-empty value is rejected.
 */
export const HONEYPOT_FIELD = "hp_7f3c" as const;

/** Shown when the honeypot was filled: neutral and actionable, never says why. */
export const HONEYPOT_ERROR = "We couldn't save this draft. Please try again.";

/** The same neutral message for forms that are not drafts (contact, claim, vendor interest). */
export const FORM_RETRY_ERROR = "We couldn't save this. Please try again.";

const honeypotField = z.string().max(0, { error: HONEYPOT_ERROR }).optional();

/** True when the honeypot is the only invalid field (a bot, or autofill filling a hidden field). */
export function isHoneypotOnly(errors: Record<string, unknown>): boolean {
  const keys = Object.keys(errors);
  return keys.length === 1 && keys[0] === HONEYPOT_FIELD;
}

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
  [HONEYPOT_FIELD]: honeypotField,
});

export type ReviewDraftInput = z.input<typeof reviewDraftSchema>;
export type ReviewDraftValues = z.output<typeof reviewDraftSchema>;

// --- Contact ------------------------------------------------------------------------

/** An optional product slug; an empty choice means "none". */
const optionalProductField = z
  .union([z.literal("").transform(() => undefined), slugField("Choose a product from the list.")])
  .optional();

/** What a contact message is about (stored value, label). */
export const CONTACT_TOPIC_OPTIONS = [
  { value: "general", label: "A general question" },
  { value: "demo", label: "A demo or a question for a vendor" },
  { value: "correction", label: "A correction to a listing" },
  { value: "vendor", label: "Listing my product or the vendor programme" },
  { value: "editorial", label: "Editorial, press or partnerships" },
  { value: "privacy", label: "Privacy or my data" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPIC_OPTIONS)[number]["value"];

const CONTACT_TOPIC_VALUES = CONTACT_TOPIC_OPTIONS.map((option) => option.value) as [ContactTopic, ...ContactTopic[]];

export const contactSchema = z.object({
  name: textField("your name", 2, 100),
  email: emailField,
  topic: z.enum(CONTACT_TOPIC_VALUES, { error: "Choose what your message is about." }).default("general"),
  product: optionalProductField,
  message: textField("a message", 10, 5000, "Your message must be at least 10 characters."),
  [HONEYPOT_FIELD]: honeypotField,
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
  [HONEYPOT_FIELD]: honeypotField,
});

export type ClaimInput = z.input<typeof claimSchema>;
export type ClaimValues = z.output<typeof claimSchema>;

// --- Vendor interest ----------------------------------------------------------------

const MAX_URL_LENGTH = 200;

/**
 * True for an absolute http(s) URL whose host has at least one dot (so
 * `https://localhost` and bare words are rejected). Other schemes, such as
 * `javascript:` or `mailto:`, are never accepted.
 */
export function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\//i.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname;
  return host.includes(".") && !host.startsWith(".") && !host.endsWith(".") && !/\s/.test(value);
}

/** An optional website: blank means none; otherwise a full http(s) address. */
const optionalWebsiteField = z
  .string()
  .trim()
  .max(MAX_URL_LENGTH, { error: `The website address must be at most ${MAX_URL_LENGTH} characters.` })
  .refine((value) => value === "" || isHttpUrl(value), {
    error: "Enter the full website address, starting with https://",
  })
  .transform((value) => (value === "" ? undefined : value))
  .optional();

/** Plans a vendor can register interest in, plus "not sure yet". */
export const PLAN_INTEREST_VALUES = [...PLAN_IDS, "undecided"] as [PlanId | "undecided", ...(PlanId | "undecided")[]];

export type PlanInterest = (typeof PLAN_INTEREST_VALUES)[number];

export const vendorInterestSchema = z.object({
  name: textField("your name", 2, 100),
  email: emailField,
  company: textField("your company", 2, 120),
  website: optionalWebsiteField,
  plan: z.enum(PLAN_INTEREST_VALUES, { error: "Choose the plan you are interested in, or Not sure yet." }),
  [HONEYPOT_FIELD]: honeypotField,
});

export type VendorInterestInput = z.input<typeof vendorInterestSchema>;
export type VendorInterestValues = z.output<typeof vendorInterestSchema>;
