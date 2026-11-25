/**
 * Zod schemas for every form on the site. Forms validate on the client with
 * these and store via `lib/submissions.ts`; a real API can reuse the same
 * schemas server side later. Task 11 adds the review, contact and claim schemas.
 */
import { z } from "zod";

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
