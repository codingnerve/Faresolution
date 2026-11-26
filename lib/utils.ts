import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Pricing } from "@/lib/data/types";
import { pricingModelLabel } from "@/lib/directory/labels";

export const SITE_URL = "https://faresolution.org";
export const SITE_NAME = "Faresolution";

/** Merge class names; later Tailwind utilities override earlier conflicting ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Absolute URL on the canonical site origin for a site-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True for an absolute http(s) URL: only those become outbound links. */
export function isWebUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

/** One or two uppercase initials for a monogram ("Northwind Ledger" -> "NL"). */
export function getInitials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function parseHex(color: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/**
 * True when white text on this hex colour would fall below 3:1 contrast
 * (WCAG relative luminance), so dark text should be used instead.
 * Invalid input counts as dark.
 */
export function isLightColor(color: string): boolean {
  const rgb = parseHex(color);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithWhite < 3;
}

/**
 * One-line pricing summary from known facts only, e.g.
 * "Freemium · Free plan available". The pricing model, a starting price
 * (verbatim, never derived) and free plan / trial flags appear only when set;
 * with nothing known it reads "Pricing not verified".
 */
export function formatPricing({ pricing }: { pricing: Pricing }): string {
  const parts: string[] = [];
  if (pricing.model) parts.push(pricingModelLabel[pricing.model]);
  const startingPrice = pricing.startingPrice?.trim();
  if (startingPrice) parts.push(`From ${startingPrice}`);
  if (pricing.freePlan === true && pricing.model !== "free") parts.push("Free plan available");
  if (pricing.freePlan === false) parts.push("No free plan");
  if (pricing.freeTrial === true) parts.push("Free trial available");
  if (pricing.freeTrial === false) parts.push("No free trial");
  return parts.length > 0 ? parts.join(" · ") : "Pricing not verified";
}
