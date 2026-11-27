/**
 * Display helpers for the published price strings in the catalogue
 * ("$15/user/mo", "From $20/user/mo", "Free"). Prices stay strings in the data
 * (vendors bill in too many shapes to model as numbers); this only splits one
 * into its parts so the amount can be set large and the unit small.
 */

export interface PriceParts {
  /** "From" for a group of plans, otherwise null. */
  prefix: string | null;
  /** "$15", "Free", or the whole string when it has no recognisable amount. */
  amount: string;
  /** "/user/mo", " per 1,000 contacts", or null. */
  unit: string | null;
}

const PRICE = /^(from\s+)?([$€£₹][\d,]+(?:\.\d+)?)(.*)$/i;

/** Splits a price string for display, or `null` when there is no price. */
export function priceParts(price: string | null | undefined): PriceParts | null {
  const value = price?.trim();
  if (!value) return null;
  const match = PRICE.exec(value);
  if (!match) return { prefix: null, amount: value, unit: null };
  const unit = match[3].trim();
  return {
    prefix: match[1] ? "From" : null,
    amount: match[2],
    unit: unit ? (unit.startsWith("/") ? unit : ` ${unit}`) : null,
  };
}

/** True for a plan priced at nothing ("Free", "$0/mo"). */
export function isFreePrice(price: string | null | undefined): boolean {
  const value = price?.trim().toLowerCase();
  if (!value) return false;
  return value === "free" || /^[$€£₹]0(?:\.0+)?(?:\/|\s|$)/.test(value);
}

const checkedFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "27 Nov 2026" for an ISO date, or null when it does not parse. */
export function formatCheckedAt(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : checkedFormat.format(time);
}
