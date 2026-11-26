/**
 * Vendor plan tiers for /vendors and /vendors/pricing. Plain config, not
 * catalogue data: the vendor programme opens at launch, so every capability
 * here is planned and no plan has a price. There are deliberately no price
 * fields (`plans.test.ts` fails if one is added); the pages show
 * `PLAN_PRICING_STATUS` instead.
 *
 * No plan changes how reviews are treated, how products are ordered in
 * organic results or what the editors recommend. Those rules live on the
 * pricing page and in the review guidelines.
 */

export const PLAN_PRICING_STATUS = "Pricing announced at launch";

export type CapabilityGroup = "Listing" | "Reviews" | "Buyer requests" | "Insights" | "Advertising";

export interface PlanCapability {
  id: string;
  group: CapabilityGroup;
  label: string;
  description: string;
}

export const PLAN_CAPABILITIES = [
  {
    id: "claim-profile",
    group: "Listing",
    label: "Claim and maintain your profile",
    description: "Confirm you represent the product, then keep its description, features, deployment and links up to date.",
  },
  {
    id: "corrections",
    group: "Listing",
    label: "Priority fact corrections",
    description: "Corrections to your listing's facts are checked and applied ahead of general requests.",
  },
  {
    id: "media",
    group: "Listing",
    label: "Screenshots and product media",
    description: "Add your own screenshots and short product videos, shown on the profile's screenshots tab.",
  },
  {
    id: "multi-product",
    group: "Listing",
    label: "Several products under one vendor",
    description: "Manage every product your company makes from one vendor account, with shared company details.",
  },
  {
    id: "review-responses",
    group: "Reviews",
    label: "Public responses to reviews",
    description: "Post one public response to each review of your product, marked as coming from you.",
  },
  {
    id: "review-invitations",
    group: "Reviews",
    label: "Review invitation links",
    description: "Send your customers a link to review your product. Invited reviews will be labelled and checked like any other.",
  },
  {
    id: "buyer-requests",
    group: "Buyer requests",
    label: "Demo and contact requests from buyers",
    description: "Receive requests only from buyers who choose to contact you, with only the details they choose to share.",
  },
  {
    id: "request-routing",
    group: "Buyer requests",
    label: "Request routing to your team",
    description: "Send buyer requests to the right people or region in your team, by email or a connected CRM.",
  },
  {
    id: "profile-insights",
    group: "Insights",
    label: "Profile insights",
    description: "Aggregate counts of profile views and outbound website clicks, never tied to an individual visitor.",
  },
  {
    id: "comparison-insights",
    group: "Insights",
    label: "Comparison and alternatives insights",
    description: "How often your product appears in comparisons and alternatives pages, and which products it is compared with.",
  },
  {
    id: "data-export",
    group: "Insights",
    label: "Data export",
    description: "Download your insights and buyer requests as CSV for your own reporting.",
  },
  {
    id: "sponsored-placements",
    group: "Advertising",
    label: "Sponsored placements",
    description: "Paid slots in category and comparison pages, always labelled Sponsored and kept apart from organic results.",
  },
] as const satisfies readonly PlanCapability[];

export type CapabilityId = (typeof PLAN_CAPABILITIES)[number]["id"];

export interface VendorPlan {
  id: string;
  name: string;
  /** Who the plan is for, in one or two sentences. */
  audience: string;
  summary: string;
  capabilities: readonly CapabilityId[];
}

export const VENDOR_PLANS = [
  {
    id: "listing",
    name: "Listing",
    audience: "For vendors who want their product's profile to be accurate and to answer reviewers in their own words.",
    summary: "Claim your profile, keep its facts current and respond publicly to reviews once collection opens.",
    capabilities: ["claim-profile", "review-responses"],
  },
  {
    id: "growth",
    name: "Growth",
    audience: "For teams that want to hear from buyers who are actively comparing products in their category.",
    summary: "Everything in Listing, plus consent-based buyer requests, richer media and insight into how buyers find you.",
    capabilities: [
      "claim-profile",
      "corrections",
      "media",
      "review-responses",
      "review-invitations",
      "buyer-requests",
      "profile-insights",
      "comparison-insights",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "For companies with several products or regions, and teams that want labelled sponsored placements.",
    summary: "Everything in Growth, plus several products under one account, request routing, data export and sponsored placements.",
    capabilities: [
      "claim-profile",
      "corrections",
      "media",
      "multi-product",
      "review-responses",
      "review-invitations",
      "buyer-requests",
      "request-routing",
      "profile-insights",
      "comparison-insights",
      "data-export",
      "sponsored-placements",
    ],
  },
] as const satisfies readonly VendorPlan[];

export type PlanId = (typeof VENDOR_PLANS)[number]["id"];

export const PLAN_IDS = VENDOR_PLANS.map((plan) => plan.id) as [PlanId, ...PlanId[]];

export function planIncludes(plan: VendorPlan, capability: string): boolean {
  return (plan.capabilities as readonly string[]).includes(capability);
}

export function getPlan(id: string): VendorPlan | null {
  return VENDOR_PLANS.find((plan) => plan.id === id) ?? null;
}
