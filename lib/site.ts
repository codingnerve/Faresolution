/**
 * Site-wide configuration that is not part of the catalogue data.
 */

export const SITE_TAGLINE = "Find. Compare. Choose Better.";

export const OWNER_CONTACT = {
  phone: "+91 85868 18383",
  phoneHref: "tel:+918586818383",
  email: "nkumar92729@gmail.com",
  emailHref: "mailto:nkumar92729@gmail.com",
} as const;

/**
 * Year shown in the footer copyright. A constant rather than `new Date()`:
 * with Cache Components, reading the clock during prerender is not allowed
 * in an uncached server component. Update it each January.
 */
export const COPYRIGHT_YEAR = 2026;

export interface SocialLink {
  /** Network name, used as the accessible link text (e.g. "LinkedIn"). */
  label: string;
  /** Full https URL of an existing, official Faresolution profile. */
  href: string;
}

/**
 * Official social profiles. Left empty on purpose: no profile has been
 * confirmed yet, and the footer renders no social links while this is empty.
 * Add an entry only once the profile URL is live.
 */
export const socialLinks: SocialLink[] = [];
