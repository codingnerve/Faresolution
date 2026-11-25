import type { PopularComparison } from "../types";

// Editor-picked comparisons. Slugs are listed in canonical (alphabetical)
// order, matching how compare URLs are built, so each entry maps to exactly
// one /compare/<a>-vs-<b> URL.
export const popularComparisons: PopularComparison[] = [
  { slugs: ["hubspot-crm", "zoho-crm"] },
  { slugs: ["hubspot-crm", "pipedrive", "salesforce-sales-cloud"] },
  { slugs: ["asana", "monday-com"] },
  { slugs: ["asana", "clickup", "trello"] },
  { slugs: ["quickbooks-online", "xero"] },
  { slugs: ["freshdesk", "zendesk"] },
  { slugs: ["microsoft-power-bi", "tableau"] },
  { slugs: ["amplitude", "mixpanel"] },
  { slugs: ["shopify", "woocommerce"] },
  { slugs: ["squarespace", "wix"] },
  { slugs: ["microsoft-teams", "slack"] },
  { slugs: ["confluence", "notion"] },
  { slugs: ["box", "dropbox"] },
  { slugs: ["make", "n8n", "zapier"] },
  { slugs: ["activecampaign", "mailchimp"] },
  { slugs: ["klaviyo", "mailchimp"] },
];
