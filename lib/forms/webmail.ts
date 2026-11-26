/**
 * Free webmail detection for the listing claim form. A claim from a personal
 * mailbox is allowed; the form only shows a soft hint that a company address
 * will make verification quicker once claims open.
 */
import { emailField } from "@/lib/validation";

/** Common free webmail domains (lower case). Subdomains also match. */
export const FREE_WEBMAIL_DOMAINS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.de",
  "web.de",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "qq.com",
  "163.com",
  "fastmail.com",
  "tutanota.com",
  "hey.com",
];

/** The lower-case domain of a valid email address, or null. */
export function emailDomain(value: unknown): string | null {
  const parsed = emailField.safeParse(value);
  if (!parsed.success) return null;
  const at = parsed.data.lastIndexOf("@");
  return parsed.data.slice(at + 1).toLowerCase();
}

/**
 * True when `email` is a valid address at a free webmail domain or one of
 * its subdomains. Matching is on whole labels, so `notgmail.com` and
 * `gmail.com.acme.example` are not webmail. Invalid input is never webmail.
 */
export function isFreeWebmail(email: unknown): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;
  return FREE_WEBMAIL_DOMAINS.some((free) => domain === free || domain.endsWith(`.${free}`));
}
