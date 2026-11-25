/** Display labels for the directory's enum-valued filters. Client-safe. */
import type { CompanySize, Deployment, Platform, PricingModel } from "@/lib/data/types";
import type { DirectorySort } from "./query";

export const pricingModelLabel: Record<PricingModel, string> = {
  free: "Free",
  freemium: "Freemium",
  subscription: "Subscription",
  usage: "Usage-based",
  "one-time": "One-time licence",
  custom: "Custom quote",
};

export const companySizeLabel: Record<CompanySize, string> = {
  solo: "Freelancers and solo",
  small: "Small business",
  mid: "Mid-market",
  enterprise: "Enterprise",
};

export const deploymentLabel: Record<Deployment, string> = {
  cloud: "Cloud",
  "on-premise": "On-premise",
  hybrid: "Hybrid",
};

export const platformLabel: Record<Platform, string> = {
  web: "Web",
  ios: "iOS",
  android: "Android",
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
  api: "API",
};

export const sortLabel: Record<DirectorySort, string> = {
  relevance: "Best match",
  name: "Name (A to Z)",
  newest: "Recently added",
  rating: "Highest rated",
  trending: "Editor's ranking",
};

/** Label lookup that never returns `undefined` (falls back to the raw value). */
export function labelFor<K extends string>(map: Record<K, string>, value: string): string {
  return Object.prototype.hasOwnProperty.call(map, value) ? map[value as K] : value;
}
