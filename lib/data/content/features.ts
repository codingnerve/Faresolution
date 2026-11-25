import type { Feature } from "../types";

// Feature taxonomy used to tag products. Slugs are stable identifiers.
export const features: Feature[] = [
  // Sales and CRM
  { slug: "contact-management", name: "Contact management", group: "Sales and CRM", description: "Store people and companies with history, notes and custom fields in one searchable record." },
  { slug: "pipeline-management", name: "Pipeline management", group: "Sales and CRM", description: "Move deals through visual stages with owners, values and expected close dates." },
  { slug: "sales-forecasting", name: "Sales forecasting", group: "Sales and CRM", description: "Project future revenue from open deals, stage weighting and rep-level targets." },
  { slug: "sales-sequences", name: "Sales sequences", group: "Sales and CRM", description: "Automate multi-step outreach across email, calls and tasks for prospecting." },
  { slug: "lead-scoring", name: "Lead scoring", group: "Sales and CRM", description: "Rank leads by fit and behaviour so the team works the most promising ones first." },
  // Marketing
  { slug: "email-campaigns", name: "Email campaigns", group: "Marketing", description: "Design, schedule and send email to segmented lists with delivery reporting." },
  { slug: "marketing-automation", name: "Marketing automation", group: "Marketing", description: "Trigger messages and tasks from behaviour such as sign-ups, page visits or purchases." },
  { slug: "landing-pages", name: "Landing pages and forms", group: "Marketing", description: "Build capture pages and forms that feed contacts straight into your database." },
  { slug: "segmentation", name: "Audience segmentation", group: "Marketing", description: "Group contacts by attributes and activity to target messages precisely." },
  { slug: "ab-testing", name: "A/B testing", group: "Marketing", description: "Compare variants of a message or page to see which performs better." },
  // Work management and collaboration
  { slug: "task-management", name: "Task management", group: "Work management", description: "Assign tasks with owners, due dates, priorities and status." },
  { slug: "kanban-boards", name: "Kanban boards", group: "Work management", description: "Visualise work as cards moving across columns." },
  { slug: "gantt-timelines", name: "Gantt and timelines", group: "Work management", description: "Plan schedules with dependencies and see how slips affect delivery dates." },
  { slug: "time-tracking", name: "Time tracking", group: "Work management", description: "Log hours against tasks or projects for billing and capacity planning." },
  { slug: "resource-management", name: "Resource management", group: "Work management", description: "Plan who is available and how much work each person carries." },
  { slug: "team-chat", name: "Team chat", group: "Collaboration", description: "Channels and direct messages for day-to-day team conversation." },
  { slug: "video-meetings", name: "Video meetings", group: "Collaboration", description: "Host video calls with screen sharing and recording." },
  { slug: "file-sharing", name: "File storage and sharing", group: "Collaboration", description: "Store files centrally and share them with permissions and version history." },
  { slug: "wiki-knowledge-base", name: "Wiki and knowledge base", group: "Collaboration", description: "Write and organise internal or customer-facing documentation." },
  // Finance and operations
  { slug: "invoicing", name: "Invoicing", group: "Finance and operations", description: "Create and send invoices, track payment status and send reminders." },
  { slug: "expense-tracking", name: "Expense tracking", group: "Finance and operations", description: "Capture receipts and categorise spending for reporting and reimbursement." },
  { slug: "bank-reconciliation", name: "Bank reconciliation", group: "Finance and operations", description: "Match bank transactions to ledger entries." },
  { slug: "financial-reporting", name: "Financial reporting", group: "Finance and operations", description: "Produce profit and loss, balance sheet and cash flow reports." },
  { slug: "inventory-tracking", name: "Inventory tracking", group: "Finance and operations", description: "Track stock levels, locations and movements across channels." },
  { slug: "purchase-orders", name: "Purchase orders", group: "Finance and operations", description: "Raise and track orders with suppliers and match them to receipts." },
  // People
  { slug: "employee-records", name: "Employee records", group: "People", description: "Maintain employee profiles, documents and org structure." },
  { slug: "payroll-processing", name: "Payroll processing", group: "People", description: "Calculate pay, withholdings and filings for each pay run." },
  { slug: "applicant-tracking", name: "Applicant tracking", group: "People", description: "Post jobs, collect applicants and move candidates through hiring stages." },
  { slug: "time-off-management", name: "Time-off management", group: "People", description: "Request, approve and track leave and holidays." },
  // Customer support
  { slug: "ticketing", name: "Ticketing", group: "Customer support", description: "Turn customer requests into tracked tickets with assignment and status." },
  { slug: "live-chat", name: "Live chat", group: "Customer support", description: "Chat with visitors on your site or app in real time." },
  { slug: "chatbots", name: "Chatbots", group: "Customer support", description: "Automated conversations that answer common questions or collect details." },
  { slug: "help-center", name: "Help center", group: "Customer support", description: "Publish self-service articles customers can search." },
  // Data and analytics
  { slug: "dashboards", name: "Dashboards", group: "Data and analytics", description: "Combine charts and metrics on one customisable view." },
  { slug: "custom-reports", name: "Custom reports", group: "Data and analytics", description: "Build and schedule reports tailored to your own fields and filters." },
  { slug: "product-analytics", name: "Product and event analytics", group: "Data and analytics", description: "Analyse user behaviour such as funnels, retention and event paths." },
  // Security and admin
  { slug: "single-sign-on", name: "Single sign-on (SSO)", group: "Security and admin", description: "Let people sign in with a central identity provider." },
  { slug: "two-factor-authentication", name: "Two-factor authentication", group: "Security and admin", description: "Require a second proof of identity at sign-in." },
  { slug: "role-based-access", name: "Role-based access control", group: "Security and admin", description: "Restrict what each user can see and change by role." },
  { slug: "audit-logs", name: "Audit logs", group: "Security and admin", description: "Keep a record of who did what and when." },
  // Platform
  { slug: "api-access", name: "API access", group: "Platform", description: "Connect the product to your own systems through a documented API." },
  { slug: "workflow-automation", name: "Workflow automation", group: "Platform", description: "Automate repetitive multi-step processes with rules and triggers." },
  { slug: "mobile-app", name: "Mobile app", group: "Platform", description: "Use the product from a native iOS or Android app." },
  { slug: "ai-assistant", name: "AI assistant", group: "Platform", description: "Built-in generative or predictive assistance for drafting, summarising or recommending." },
  // Commerce and web
  { slug: "online-storefront", name: "Online storefront", group: "Commerce and web", description: "Sell products online with catalogue, cart and checkout." },
  { slug: "payment-processing", name: "Payment processing", group: "Commerce and web", description: "Accept card and wallet payments." },
  { slug: "website-builder", name: "Drag-and-drop site builder", group: "Commerce and web", description: "Design pages visually without writing code." },
  { slug: "seo-tools", name: "SEO tools", group: "Commerce and web", description: "Control titles, descriptions, redirects and sitemaps for search visibility." },
];
