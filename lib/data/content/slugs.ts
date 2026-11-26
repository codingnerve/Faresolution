/**
 * Slug lists for the route guards (proxy.ts) and client code that only needs
 * to know which slugs exist, so neither bundles the full content files
 * (products.ts alone is ~170KB). Kept in catalogue order; `slugs.test.ts`
 * fails if these drift from `products` / `categories` / `industries` /
 * `articles`.
 */
import type { ArticleKind } from "../types";

export const PRODUCT_SLUGS: readonly string[] = [
  "hubspot-crm",
  "zoho-crm",
  "salesforce-sales-cloud",
  "pipedrive",
  "outreach",
  "apollo-io",
  "asana",
  "trello",
  "monday-com",
  "clickup",
  "jira",
  "slack",
  "microsoft-teams",
  "zoom",
  "notion",
  "confluence",
  "dropbox",
  "box",
  "zapier",
  "make",
  "n8n",
  "quickbooks-online",
  "xero",
  "freshbooks",
  "netsuite",
  "odoo",
  "zoho-inventory",
  "cin7",
  "bamboohr",
  "gusto",
  "adp-workforce-now",
  "greenhouse",
  "workable",
  "hubspot-marketing-hub",
  "activecampaign",
  "mailchimp",
  "brevo",
  "klaviyo",
  "zendesk",
  "freshdesk",
  "intercom",
  "tidio",
  "tableau",
  "microsoft-power-bi",
  "looker-studio",
  "google-analytics",
  "mixpanel",
  "amplitude",
  "shopify",
  "woocommerce",
  "wix",
  "squarespace",
  "webflow",
  "crowdstrike-falcon",
  "okta",
  "1password",
  "mongodb-atlas",
  "supabase",
  "datadog",
  "terraform",
];

export const CATEGORY_SLUGS: readonly string[] = [
  "crm-software",
  "sales-software",
  "project-management",
  "accounting-software",
  "erp-software",
  "inventory-management",
  "hr-software",
  "payroll-software",
  "recruiting-software",
  "marketing-automation",
  "email-marketing",
  "customer-support",
  "help-desk",
  "ai-chatbots",
  "analytics",
  "business-intelligence",
  "ecommerce",
  "website-builders",
  "cybersecurity",
  "video-conferencing",
  "document-management",
  "database-software",
  "collaboration-software",
  "cloud-management",
  "workflow-automation",
];

export const INDUSTRY_SLUGS: readonly string[] = [
  "healthcare",
  "education",
  "retail",
  "finance",
  "real-estate",
  "manufacturing",
  "construction",
  "hospitality",
  "transportation",
  "legal",
  "marketing",
  "professional-services",
];

/** Article slugs per kind, in content order. A slug is only valid under its own kind's route. */
export const ARTICLE_SLUGS: Readonly<Record<ArticleKind, readonly string[]>> = {
  blog: ["five-questions-before-adding-another-saas-tool", "what-a-free-plan-is-really-for"],
  guide: [
    "how-to-run-a-software-trial",
    "software-data-migration-checklist",
    "security-questionnaire-basics-for-small-teams",
    "automate-a-business-process-without-breaking-it",
  ],
  "best-software": [
    "crm-tools-to-shortlist-for-small-sales-teams",
    "project-management-tools-to-shortlist-for-small-teams",
  ],
  research: ["a-framework-for-scoring-software-vendors", "how-faresolution-handles-product-facts-and-reviews"],
  "buying-guide": [
    "how-to-choose-accounting-software",
    "hr-and-payroll-software-buying-guide",
    "how-to-choose-customer-support-software",
  ],
};

export const productSlugSet: ReadonlySet<string> = new Set(PRODUCT_SLUGS);
export const categorySlugSet: ReadonlySet<string> = new Set(CATEGORY_SLUGS);
export const industrySlugSet: ReadonlySet<string> = new Set(INDUSTRY_SLUGS);
export const articleSlugSets: Readonly<Record<ArticleKind, ReadonlySet<string>>> = {
  blog: new Set(ARTICLE_SLUGS.blog),
  guide: new Set(ARTICLE_SLUGS.guide),
  "best-software": new Set(ARTICLE_SLUGS["best-software"]),
  research: new Set(ARTICLE_SLUGS.research),
  "buying-guide": new Set(ARTICLE_SLUGS["buying-guide"]),
};
