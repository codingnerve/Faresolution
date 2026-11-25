import type { Industry } from "../types";

// Industry guidance is general buying advice, not legal, regulatory or
// compliance advice. Regulations differ by country and change over time.
export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: "HeartPulse",
    tagline: "Software for clinics, practices and care organisations that handle sensitive patient information.",
    intro:
      "Healthcare organisations run on a mix of clinical systems and ordinary business software, and the two meet in awkward places: appointment reminders that touch patient details, shared drives full of referral letters, support inboxes where someone pastes a medical question. The software you choose for the administrative side still has to respect how patient information is allowed to move.\n\nThat makes data handling the first filter rather than the last. Before comparing features, find out whether a vendor will sign the agreements your jurisdiction requires, where data is stored, how access is logged and what happens to records when you leave. Smaller practices also need tools that fit thin staffing, because a platform that demands a dedicated administrator rarely survives past the pilot.",
    commonNeeds: [
      "Secure storage and sharing of documents containing personal health information",
      "Staff scheduling, onboarding and credential tracking",
      "Patient or client communication that avoids exposing details over insecure channels",
      "Billing, invoicing and financial reporting that match payer-driven revenue cycles",
      "Audit trails showing who accessed what",
    ],
    selectionAdvice: [
      {
        heading: "Ask about data-protection agreements early",
        body: "If a tool will touch protected health information, ask the vendor whether it will sign a business associate agreement (in the United States) or the equivalent data-processing terms in your country, and which plans that covers. Some vendors restrict this to higher tiers. Treat a vague answer as a no until it is in writing, and have counsel confirm what applies to you.",
      },
      {
        heading: "Separate clinical systems from administrative ones",
        body: "Electronic health record and practice-management systems are a specialised market and are not covered by general business categories on Faresolution. For everything around them, such as HR, accounting, document storage and collaboration, prefer tools with strong access controls and audit logs, and keep clinical notes inside the clinical system.",
      },
      {
        heading: "Check access control and logging, not just encryption",
        body: "Role-based permissions, enforced sign-in methods and an audit log matter as much as encryption in practice, because most incidents involve over-broad access or shared credentials. Confirm you can remove a departed employee's access in one step and review who opened a sensitive file.",
      },
      {
        heading: "Plan for shift-based and part-time staff",
        body: "Rosters, per-seat pricing and permissions all behave differently when many people work irregular hours. Count every person who will need an account, including locums and part-timers, before comparing per-user prices.",
      },
    ],
    recommendedCategorySlugs: ["hr-software", "document-management", "accounting-software", "cybersecurity", "customer-support"],
    faq: [
      { q: "Can general business software be used in healthcare?", a: "Sometimes, but only if the vendor supports the data-protection terms your jurisdiction requires for the plan you buy. Confirm in writing and check with a qualified adviser before putting patient information into any tool." },
      { q: "Do I need a separate system for patient records?", a: "Usually yes. Clinical records belong in a purpose-built system designed for that regulatory context. General tools are better suited to the administrative work around it." },
      { q: "What should I look for in a vendor's security documentation?", a: "Look for recognised audit reports or certifications, a clear description of where data is stored, a breach-notification commitment and documented controls for access and logging. Ask for the current documents rather than relying on a marketing page." },
      { q: "Is Faresolution able to tell me whether a product is compliant?", a: "No. Faresolution is a discovery and comparison site using sample data, and it does not certify compliance. Always verify with the vendor and your own advisers." },
    ],
    seoTitle: "Software for Healthcare Organisations",
    seoDescription: "How healthcare practices and care organisations can choose business software, with guidance on data protection, access controls and categories to shortlist.",
  },
  {
    slug: "education",
    name: "Education",
    icon: "GraduationCap",
    tagline: "Tools for schools, colleges and training providers balancing tight budgets with student privacy.",
    intro:
      "Education buyers face an unusual combination of constraints: many users with little training time, seasonal peaks around term start and enrolment, strict expectations about student data and budgets that are often set annually. Software that is delightful for a startup can be unworkable when five hundred staff need accounts on the same day.\n\nThe practical goal is to choose tools that are easy to roll out, easy to explain and easy to leave. Look for straightforward single sign-on, sensible pricing for large numbers of occasional users and clear commitments about how student information is used. Many vendors offer education pricing, so ask before assuming the list price applies.",
    commonNeeds: [
      "Communication between staff, students and families across devices",
      "Document storage and sharing with sensible permissions",
      "Video lessons and meetings with recording and accessibility options",
      "Staff scheduling, HR records and payroll",
      "Student-support and enquiry handling at enrolment peaks",
    ],
    selectionAdvice: [
      {
        heading: "Check how student data is handled",
        body: "Ask what personal information the product collects, whether it is used for advertising or model training, and how it is deleted. Rules about children's and students' data vary by country and by age group, so confirm requirements with your institution's data-protection lead before adopting a tool.",
      },
      {
        heading: "Prioritise single sign-on and bulk provisioning",
        body: "Creating accounts one at a time does not scale. Prefer products that connect to your existing identity provider, support roster imports and remove access automatically when someone leaves.",
      },
      {
        heading: "Ask for education pricing and reconcile it with peak usage",
        body: "Many vendors discount for schools and non-profits, and some price by active users rather than total accounts. Model the term-start peak, not the quiet weeks, and ask what happens if you exceed a plan during enrolment.",
      },
      {
        heading: "Test with real accessibility needs",
        body: "Try captions, keyboard navigation and screen-reader behaviour with the people who need them. A tool that is hard to use with assistive technology creates a duty-of-care problem, not just an inconvenience.",
      },
    ],
    recommendedCategorySlugs: ["video-conferencing", "collaboration-software", "document-management", "hr-software", "help-desk"],
    faq: [
      { q: "Are there discounts for schools and universities?", a: "Many vendors offer education or non-profit pricing, but it is rarely shown on the public price page. Ask sales directly and request the terms in writing." },
      { q: "What is the main risk with free tools in a school?", a: "Free plans often come with different data-use terms than paid plans, and accounts may be tied to individuals rather than the institution. Check the terms before staff or students sign up on their own." },
      { q: "How should we pilot a tool?", a: "Run a small pilot with a mix of enthusiastic and sceptical staff, set a clear end date, and decide in advance what result would make you adopt or drop the tool." },
      { q: "Does Faresolution list learning management systems?", a: "Not in this showcase. The categories here cover the business and operational software around teaching, such as communication, documents, HR and support." },
    ],
    seoTitle: "Software for Schools, Colleges and Training Providers",
    seoDescription: "Guidance on choosing communication, document, HR and support software for education, with advice on student data, single sign-on and education pricing.",
  },
  {
    slug: "retail",
    name: "Retail",
    icon: "ShoppingBag",
    tagline: "Selling across shops, marketplaces and websites without losing track of stock or customers.",
    intro:
      "Retail software has to keep three things in agreement: what you have in stock, what you have sold and what the customer was told. When a shop, a website and a marketplace each keep their own view, the result is overselling, refunds and unhappy customers. Choosing tools that share a single source of truth for inventory and orders is usually worth more than any single headline feature.\n\nMargins in retail are thin, so cost scales with volume matters more than the entry price. Pay attention to transaction fees, per-channel add-ons and the cost of the apps you will need to bolt on. A platform that looks inexpensive can become the most expensive item on the profit-and-loss statement once volume grows.",
    commonNeeds: [
      "Online storefront with reliable checkout and payment options",
      "Inventory tracking across locations and sales channels",
      "Email and SMS marketing tied to purchase history",
      "Customer support for orders, returns and delivery questions",
      "Accounting that reconciles sales, fees and refunds",
    ],
    selectionAdvice: [
      {
        heading: "Make inventory the anchor decision",
        body: "Decide how stock will be tracked first, then choose storefront and marketing tools that connect to it. If you sell in person and online, confirm that a sale in either place updates the same count within a minute or two, not at the end of the day.",
      },
      {
        heading: "Add up fees, not just plan prices",
        body: "Include payment processing fees, transaction fees on third-party gateways, app subscriptions and the cost of any theme or developer help. Compare the total at your expected monthly order volume and at double that volume.",
      },
      {
        heading: "Plan for seasonal peaks",
        body: "Ask how the platform behaves at your busiest week, whether checkout stays available during sales and how support responds under load. Load-test your promotions where you can.",
      },
      {
        heading: "Keep the way out open",
        body: "Confirm you can export products, customers and order history in standard formats and keep your own domain. Lock-in is easiest to avoid before the catalogue is large.",
      },
    ],
    recommendedCategorySlugs: ["ecommerce", "inventory-management", "email-marketing", "accounting-software", "customer-support"],
    faq: [
      { q: "Should I start with a hosted platform or a plugin on my own site?", a: "A hosted platform removes most maintenance and is usually quicker to launch. A plugin or self-hosted option offers more control but means you handle updates, security and hosting." },
      { q: "Do I need separate inventory software?", a: "Not at first if you sell from one channel. Once you sell from several places or hold stock in several locations, a dedicated inventory tool or ERP usually pays for itself in fewer errors." },
      { q: "How do I compare payment fees?", a: "Calculate the blended cost at your average order value, including fixed per-transaction fees, and include fees charged by the platform itself on top of the processor." },
      { q: "Where do reviews and ratings come from on Faresolution?", a: "They do not exist yet. Faresolution shows no ratings or reviews in this build, and says so on each page." },
    ],
    seoTitle: "Software for Retail and Online Selling",
    seoDescription: "How retailers can choose ecommerce, inventory, marketing and accounting software, with advice on fees, stock accuracy and seasonal peaks.",
  },
  {
    slug: "finance",
    name: "Finance",
    icon: "Landmark",
    tagline: "Business software for firms where security reviews, audit trails and data residency are non-negotiable.",
    intro:
      "Financial services buyers are rarely choosing a tool in isolation. Security teams, compliance officers and sometimes outside regulators have a say, and a promising product can stall for months in vendor due diligence. Starting with the requirements those reviewers will ask for saves more time than any feature comparison.\n\nExpect questions about identity and access management, encryption, logging, business continuity and where data is stored and processed. The vendors that move quickly through these reviews usually publish current security documentation and can answer questionnaires without a long delay, which is itself a useful signal when you are comparing options.",
    commonNeeds: [
      "Strong identity controls such as single sign-on, multi-factor sign-in and role-based access",
      "Complete audit logs and retention that fit your record-keeping duties",
      "Document management with controlled sharing and version history",
      "Reporting and analytics that can be reconciled to source data",
      "Vendor security documentation ready for due-diligence questionnaires",
    ],
    selectionAdvice: [
      {
        heading: "Start with the security questionnaire",
        body: "Write down the controls your security and compliance teams require, then ask each shortlisted vendor for their current security documentation up front. A vendor that cannot supply it quickly is likely to slow your own review.",
      },
      {
        heading: "Verify data location and subprocessors",
        body: "Ask where data is stored and processed, which third parties handle it and how you will be told about changes. These answers affect your own regulatory obligations.",
      },
      {
        heading: "Insist on audit logs and exportable records",
        body: "Confirm that administrative actions and data access are logged, how long logs are kept and whether you can export them. Retention requirements differ by jurisdiction, so check with your compliance function.",
      },
      {
        heading: "Think about concentration risk",
        body: "If a tool becomes critical to operations, assess what happens during a vendor outage, acquisition or price rise. Ask about service-level commitments and your exit options.",
      },
    ],
    recommendedCategorySlugs: ["cybersecurity", "document-management", "business-intelligence", "accounting-software", "workflow-automation"],
    faq: [
      { q: "What certifications should I look for?", a: "Common ones include SOC 2 reports and ISO/IEC 27001 certification, but what matters is whether the scope covers the product you will use. Ask for the current report and read the scope, not just the badge." },
      { q: "Can small finance firms use the same tools as enterprises?", a: "Often yes, but enterprise controls such as single sign-on and detailed audit logs are frequently reserved for higher plans, so confirm which tier includes them." },
      { q: "Does Faresolution verify vendor security claims?", a: "No. It is a discovery site using sample data. Treat everything as a starting point and verify directly with the vendor." },
      { q: "How long does vendor due diligence usually take?", a: "It varies widely with your organisation and the vendor's readiness. Start the review in parallel with the product trial rather than after you have chosen." },
    ],
    seoTitle: "Software for Financial Services Firms",
    seoDescription: "What financial services teams should check when choosing business software: security documentation, audit logs, data location and vendor due diligence.",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "Building2",
    tagline: "Tools for agencies, property managers and developers who juggle many contacts, listings and documents.",
    intro:
      "Real estate work is built on relationships and paperwork: enquiries that arrive from many channels, viewings that need scheduling, offers and agreements that must be signed and filed. Software that keeps every contact and document tied to the property or deal it belongs to saves the most time, because the same people appear repeatedly across years.\n\nWhat works for a solo agent differs from what works for a property-management company with hundreds of units. Decide early whether you are optimising for lead generation, transaction management or ongoing tenant and owner service, since each points to a different primary tool and a different set of integrations.",
    commonNeeds: [
      "Contact and lead tracking linked to properties and deals",
      "Document storage and e-signature for agreements",
      "Email follow-up and newsletters for past and prospective clients",
      "Website and listing presentation",
      "Accounting that keeps client money separate where the rules require it",
    ],
    selectionAdvice: [
      {
        heading: "Choose a CRM that models deals, not just contacts",
        body: "Check that you can link people to properties, track multiple deals per contact and see an activity history. A generic CRM may need custom fields to do this well, so test with your real data during the trial.",
      },
      {
        heading: "Connect documents and signatures to the deal",
        body: "Look for storage and e-signature integrations that file the signed copy against the right record automatically. Manual filing is where documents get lost.",
      },
      {
        heading: "Respect client-money rules in accounting",
        body: "Rules for holding deposits and client funds differ by jurisdiction. Confirm with your accountant whether your accounting software can support the separation you are required to keep.",
      },
      {
        heading: "Make enquiry response fast",
        body: "Speed to first reply often matters more than a polished pipeline. Prefer tools that route new enquiries to a person and notify them on mobile.",
      },
    ],
    recommendedCategorySlugs: ["crm-software", "document-management", "email-marketing", "website-builders", "accounting-software"],
    faq: [
      { q: "Do I need an industry-specific real estate CRM?", a: "Not always. Specialist tools add listing and transaction features, but a flexible general CRM with custom fields can work well for smaller teams. Compare both during trials." },
      { q: "How do I handle e-signatures?", a: "Most CRMs and document tools integrate with e-signature services. Confirm the signed document is saved back to the contact or deal record automatically." },
      { q: "What matters most for a solo agent?", a: "Simplicity and mobile access. A tool that you will actually update from your phone after a viewing beats a powerful one that sits idle." },
      { q: "Does Faresolution cover listing portals?", a: "No. The showcase covers business software categories rather than property portals." },
    ],
    seoTitle: "Software for Real Estate Agencies and Property Managers",
    seoDescription: "Practical guidance for real estate teams choosing CRM, document, email marketing, website and accounting software.",
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    icon: "Factory",
    tagline: "Planning, inventory and operations software for makers who need traceability from supplier to shipment.",
    intro:
      "Manufacturers care about what they can make, with what, and by when. That connects purchasing, inventory, production and finance into one flow, which is why enterprise resource planning and inventory systems sit at the centre of most manufacturing software stacks. Choosing them well matters more than any individual add-on.\n\nThe common failure is buying for a future company rather than the current one. A system modelled on complex multi-site production can bury a ten-person workshop in configuration, while a lightweight inventory tool can run out of road when you add a second warehouse. Map your actual process first, including bills of materials and how often they change, and look for the simplest system that models it.",
    commonNeeds: [
      "Bills of materials, purchasing and stock levels in one system",
      "Production scheduling and work orders",
      "Lot or serial tracking where traceability matters",
      "Costing that links materials and labour to finished goods",
      "Integration with accounting and customer ordering",
    ],
    selectionAdvice: [
      {
        heading: "Map your process before demos",
        body: "Write down how an order becomes a shipped product, including approvals and exceptions. Ask each vendor to walk through that exact flow in a demo instead of their standard script.",
      },
      {
        heading: "Decide how much traceability you need",
        body: "If customers or regulators require lot or serial tracking, confirm it is supported at the level you need and included in your plan. Retrofitting traceability later is painful.",
      },
      {
        heading: "Budget for implementation, not just licences",
        body: "ERP projects often cost more in configuration, data migration and training than in subscription fees. Ask for a realistic implementation plan and who does the work.",
      },
      {
        heading: "Check integration with the shop floor",
        body: "Barcode scanning, label printing and machine or equipment data capture can decide whether staff use the system. Test these with real hardware before you commit.",
      },
    ],
    recommendedCategorySlugs: ["erp-software", "inventory-management", "accounting-software", "workflow-automation", "business-intelligence"],
    faq: [
      { q: "ERP or inventory software?", a: "If you mainly need stock and order tracking, inventory software is simpler. If you also need production planning, purchasing and finance in one place, an ERP is a better fit but takes longer to implement." },
      { q: "Is open-source ERP a viable option?", a: "It can be, particularly where you want customisation, but you take on more responsibility for hosting, upgrades and support unless you pay a partner." },
      { q: "How long does implementation take?", a: "It depends on scope and data quality. Ask vendors for typical timelines for a company of your size, and treat any promise of a few days with caution." },
      { q: "Does Faresolution recommend a specific system?", a: "No. Product pages are neutral summaries and carry no ratings or rankings beyond an editor-curated order labelled as such." },
    ],
    seoTitle: "Software for Manufacturers: ERP, Inventory and Operations",
    seoDescription: "How manufacturers can choose ERP, inventory, accounting and automation software, with advice on traceability, implementation and shop-floor integration.",
  },
  {
    slug: "construction",
    name: "Construction",
    icon: "HardHat",
    tagline: "Job-based work, field crews and changing schedules call for tools that work on site as well as in the office.",
    intro:
      "Construction businesses organise everything by job: costs, schedules, documents, subcontractors and invoices all belong to a project. Software built around generic tasks often fails here because it cannot answer simple questions like how much a job has cost so far compared to what was quoted. Tools that treat the project as the unit of record tend to fit better.\n\nThe other defining feature is that much of the work happens away from a desk. Mobile reliability, offline behaviour and how easily field staff can capture photos, time and notes decide whether the system holds the real picture or a stale copy. Evaluate every tool on a phone in poor reception before you evaluate it on a large monitor.",
    commonNeeds: [
      "Job costing and progress or stage billing",
      "Project scheduling that handles dependencies and weather delays",
      "Document control for drawings, contracts and change orders",
      "Time capture and payroll for field crews",
      "Mobile access for photos, forms and approvals",
    ],
    selectionAdvice: [
      {
        heading: "Test job costing with a real project",
        body: "Load one live job, including change orders and retainage if you use them, and see whether the reports match your own spreadsheet. If it cannot, it will not replace the spreadsheet.",
      },
      {
        heading: "Judge mobile and offline behaviour first",
        body: "Open the app in a basement or on a remote site and try the actions your crews actually do. Confirm what syncs later and what is lost without a connection.",
      },
      {
        heading: "Keep drawings and revisions under control",
        body: "Version control matters when an outdated drawing can cause rework. Choose a document system that clearly marks the current revision and records who viewed it.",
      },
      {
        heading: "Think about subcontractor access",
        body: "Look for limited guest or external-user access so subcontractors can see only their documents and tasks, without paying a full seat each.",
      },
    ],
    recommendedCategorySlugs: ["project-management", "accounting-software", "document-management", "hr-software", "payroll-software"],
    faq: [
      { q: "Do I need construction-specific software?", a: "Specialist tools handle job costing and stage billing natively. General project and accounting tools can work for smaller firms but may need more configuration." },
      { q: "How do I handle payroll for field crews?", a: "Look for time capture on mobile and payroll that supports multiple pay rates and job allocations. Confirm local rules for prevailing wage or union reporting with your adviser." },
      { q: "Is a Gantt chart enough?", a: "Rarely. You also need costs, documents and communication tied to the same project, so check how well the scheduling tool connects to them." },
      { q: "Does Faresolution list estimating or takeoff software?", a: "Not in the showcase. The categories focus on general business software that construction firms commonly add around their specialist tools." },
    ],
    seoTitle: "Software for Construction Companies",
    seoDescription: "Guidance on project management, accounting, document control and payroll tools for construction firms, with a focus on job costing and field mobile use.",
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    icon: "Hotel",
    tagline: "Restaurants, hotels and venues need staffing, guest communication and payments to work every service.",
    intro:
      "Hospitality runs on shifts, peaks and people. A system that goes down on a Saturday night or confuses a rota can cost more in a single evening than it saves in a month. Reliability, simple interfaces for temporary and part-time staff, and quick support outside office hours count for more than a long feature list.\n\nGuest experience extends beyond the visit. Bookings, reminders, follow-up emails and responses to reviews are all points where software can help or get in the way. Look for tools that keep a single record of each guest and make it simple to reach them at the right moment without sending anything unwanted.",
    commonNeeds: [
      "Staff scheduling, time-off requests and payroll",
      "Guest communication by email, SMS or chat",
      "A website or booking page that is easy to update",
      "Supplier ordering and stock control",
      "Payment handling that meets card-industry requirements",
    ],
    selectionAdvice: [
      {
        heading: "Prioritise reliability and offline fallback",
        body: "Ask what happens if the internet drops mid-service and how quickly support responds in the evenings and at weekends. Request real service-level terms rather than relying on a marketing promise.",
      },
      {
        heading: "Design for seasonal and temporary staff",
        body: "Per-seat pricing and onboarding effort add up when headcount swings with the season. Pick tools that are quick to learn and straightforward to deactivate.",
      },
      {
        heading: "Keep guest data tidy and permissioned",
        body: "Store guest preferences and contact details in one place, and respect marketing-consent rules in your market. Confirm the platform records consent and honours unsubscribes.",
      },
      {
        heading: "Check payment compliance responsibilities",
        body: "Using a processor that handles card data for you reduces your exposure, but confirm which responsibilities remain with your business and what the contract states.",
      },
    ],
    recommendedCategorySlugs: ["hr-software", "payroll-software", "email-marketing", "website-builders", "inventory-management"],
    faq: [
      { q: "Should hospitality businesses use specialist point-of-sale systems?", a: "Often yes for front-of-house operations. The categories on Faresolution cover the supporting business software such as HR, payroll, marketing and websites." },
      { q: "How can small venues manage staffing efficiently?", a: "Look for scheduling that lets staff swap shifts and see rosters on their phones, and make sure it feeds hours directly into payroll." },
      { q: "What is a sensible way to collect guest emails?", a: "Use a clear opt-in at booking or check-in, record consent and offer an easy unsubscribe in every message." },
      { q: "Are the prices on Faresolution current?", a: "Only where stated and verified. Most pricing is shown as not verified, so confirm with the vendor." },
    ],
    seoTitle: "Software for Restaurants, Hotels and Venues",
    seoDescription: "Choosing HR, payroll, guest-marketing, website and inventory software for hospitality businesses, with advice on reliability and seasonal staffing.",
  },
  {
    slug: "transportation",
    name: "Transportation",
    icon: "Truck",
    tagline: "Fleets, logistics and delivery operations need real-time visibility, driver records and dependable support.",
    intro:
      "Transportation and logistics companies depend on knowing where assets and people are and whether commitments will be met. General business software supports the surrounding work, including customer service, billing, workforce management and reporting, while specialist fleet and dispatch tools handle routing and vehicle data.\n\nThe key question is how well your general tools connect to the specialist systems that run operations. If customer messages, invoices and driver payroll all need hand-keyed data from the dispatch system, errors and delay follow. Prioritise open APIs and common integrations over any individual feature.",
    commonNeeds: [
      "Customer service for delivery status and exceptions",
      "Billing and accounting with job or load-level detail",
      "Driver and staff scheduling, records and payroll",
      "Reporting on on-time performance and cost per job",
      "Integration with dispatch, telematics and routing tools",
    ],
    selectionAdvice: [
      {
        heading: "Check APIs and integration options",
        body: "Look for documented APIs, webhooks and connectors for your dispatch or telematics system. Ask for a customer reference who has built that same connection.",
      },
      {
        heading: "Support for shift and mobile workers",
        body: "Drivers rarely sit at a desk, so test the mobile experience, offline behaviour and how simply people can acknowledge schedules or submit paperwork.",
      },
      {
        heading: "Plan for exceptions in customer service",
        body: "Delays, damage and missed deliveries generate most contacts. Choose a support tool that can link a conversation to a shipment record and share status updates automatically.",
      },
      {
        heading: "Confirm records and retention requirements",
        body: "Driver-hours, maintenance and safety records are subject to rules that differ by country. Confirm with a qualified adviser what you must keep and how long, then check the tools can store it.",
      },
    ],
    recommendedCategorySlugs: ["customer-support", "accounting-software", "hr-software", "workflow-automation", "business-intelligence"],
    faq: [
      { q: "Does Faresolution list fleet management or routing software?", a: "Not in the showcase. The categories cover general business software that logistics companies connect to their specialist systems." },
      { q: "How can we reduce manual data entry between systems?", a: "Use native integrations or an automation platform to pass data between dispatch, support and accounting, and test failure handling before relying on it." },
      { q: "What should we ask about uptime?", a: "Ask for the vendor's published availability commitment, how incidents are communicated and what credit or remedy applies if it is missed." },
      { q: "How do we compare support tools for delivery issues?", a: "Test the same set of realistic scenarios, such as a late delivery and a damaged parcel, in each trial and compare how many steps each takes." },
    ],
    seoTitle: "Software for Transportation and Logistics Companies",
    seoDescription: "How logistics and transportation businesses can choose customer-support, accounting, HR and automation software that connects with dispatch systems.",
  },
  {
    slug: "legal",
    name: "Legal",
    icon: "Scale",
    tagline: "Law firms and legal teams must protect privileged information while still working efficiently.",
    intro:
      "Legal work revolves around confidentiality, deadlines and accuracy. A tool that mishandles privileged material, loses a version of a document or misses a deadline reminder can cause real harm. For that reason, document management, access control and audit history usually come before convenience features in a legal buyer's checklist.\n\nTime is the product in many firms, so tools that capture time with minimal friction and feed billing directly are worth testing carefully. Equally, client-money handling is regulated, and the rules differ by jurisdiction and professional body. Treat any accounting tool as something to be checked with your regulator's guidance and your accountant, not assumed.",
    commonNeeds: [
      "Secure document storage with version history and tight permissions",
      "Time capture and billing that match your fee arrangements",
      "Client communication and intake with confidentiality protections",
      "Deadline and task tracking across matters",
      "Audit trails for access to sensitive files",
    ],
    selectionAdvice: [
      {
        heading: "Put confidentiality controls first",
        body: "Confirm per-matter or per-folder permissions, ethical-wall style restrictions where needed, sign-in controls and logs of who opened which file. Ask where data is stored and whether you can choose a region.",
      },
      {
        heading: "Make matter the central record",
        body: "Check that documents, emails, tasks and time entries can all attach to a matter so nothing lives only in an inbox.",
      },
      {
        heading: "Verify client-money handling with your regulator",
        body: "Do not assume general accounting software meets trust-accounting obligations. Check your professional body's rules and discuss them with your accountant before selecting a tool.",
      },
      {
        heading: "Test e-signature and sharing workflows",
        body: "Try sending a document for signature and sharing a draft with a client. Confirm the audit trail and final copy are stored where you expect.",
      },
    ],
    recommendedCategorySlugs: ["document-management", "accounting-software", "collaboration-software", "cybersecurity", "workflow-automation"],
    faq: [
      { q: "Can general project tools be used for case management?", a: "Possibly for small teams, but legal case-management products add matter structures, conflict checks and billing that general tools lack. Compare against your real workflow." },
      { q: "How should we assess cloud storage for client files?", a: "Ask about encryption, access controls, data location and breach procedures, and check your professional rules for any additional requirements." },
      { q: "Is this site a source of legal advice?", a: "No. Faresolution provides general information about software. Consult your regulator and advisers about professional obligations." },
      { q: "How do we avoid losing documents between systems?", a: "Pick one system of record for final documents and make sure integrations save back to it rather than leaving copies in several places." },
    ],
    seoTitle: "Software for Law Firms and Legal Teams",
    seoDescription: "Guidance for legal teams choosing document management, accounting, collaboration and security tools, with focus on confidentiality and matter-based records.",
  },
  {
    slug: "marketing",
    name: "Marketing",
    icon: "Megaphone",
    tagline: "Agencies and in-house teams juggling campaigns, content, analytics and many client accounts.",
    intro:
      "Marketing teams are among the heaviest software users in any business, and also the quickest to accumulate overlapping tools. An email platform, a CRM, a social scheduler, an analytics suite and a project tracker all hold part of the same customer story. The most valuable choice is often the one that reduces the number of places you copy data between.\n\nMeasurement deserves particular care. Different tools define sessions, conversions and attribution differently, so numbers rarely match across them. Decide which system is the source of truth for each metric before building reports, and favour tools that let you export raw data rather than only showing summaries.",
    commonNeeds: [
      "Email and automation tied to contact records",
      "Analytics for web and product behaviour",
      "Campaign planning and approvals",
      "Landing pages and forms",
      "Reporting across channels and clients",
    ],
    selectionAdvice: [
      {
        heading: "Pick a source of truth for contacts",
        body: "Decide whether your CRM or your email platform owns the contact record, then choose tools that sync in one clear direction. Two-way syncs between several systems create duplicates and conflicts.",
      },
      {
        heading: "Define metrics before comparing analytics tools",
        body: "Write down how you define a lead, a conversion and an active user. Then check each analytics product supports those definitions and lets you export the underlying events.",
      },
      {
        heading: "Mind consent and privacy rules",
        body: "Email, tracking and profiling are subject to laws that differ by region. Confirm the tool supports consent records, preference management and deletion requests, and check your own obligations with a qualified adviser.",
      },
      {
        heading: "Agencies: look at multi-client structure",
        body: "If you manage many client accounts, check workspace separation, client-level permissions and whether pricing multiplies per account.",
      },
    ],
    recommendedCategorySlugs: ["marketing-automation", "email-marketing", "analytics", "crm-software", "project-management"],
    faq: [
      { q: "Do I need a marketing automation platform or just email software?", a: "If you send newsletters and occasional campaigns, email software is enough. Choose automation when you need behaviour-based journeys and lead handoff to sales." },
      { q: "Why do analytics numbers differ between tools?", a: "Tools define and collect events differently, filter bots differently and may sample or model data. Choose one for each metric and document the definition." },
      { q: "How can small teams avoid tool sprawl?", a: "Audit what each tool uniquely does, retire overlaps and prefer products that integrate natively with your CRM." },
      { q: "Does Faresolution run advertising for vendors?", a: "No. Products are not ranked by payment, and the only ordering labelled trending is editor-curated." },
    ],
    seoTitle: "Software for Marketing Teams and Agencies",
    seoDescription: "Choose marketing automation, email, analytics, CRM and project tools for in-house teams and agencies, with advice on consent, metrics and tool sprawl.",
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    icon: "Briefcase",
    tagline: "Consultancies, accountants and agencies that sell expertise by the hour or the project.",
    intro:
      "Professional services firms sell time and judgement, so the software that matters most helps them plan capacity, track billable work and keep clients informed. Tools that connect proposals, projects, time and invoices into one flow remove the re-keying that quietly eats margin.\n\nGrowth changes requirements quickly. A five-person consultancy can run on a CRM, a shared drive and an accounting package, but at twenty-five people utilisation, forecasting and consistent delivery processes start to matter. Choose systems that can scale one step beyond your current size without forcing a rebuild.",
    commonNeeds: [
      "Pipeline and proposal tracking from enquiry to signed engagement",
      "Project planning with capacity visibility",
      "Time tracking linked to invoicing",
      "Client collaboration and document sharing",
      "Reporting on utilisation, margin and cash flow",
    ],
    selectionAdvice: [
      {
        heading: "Link time, projects and invoices",
        body: "Check that time logged against a project flows into invoices and reports without re-entry. Gaps between these three are the usual source of write-offs.",
      },
      {
        heading: "Model your real billing arrangements",
        body: "Fixed fee, retainer, milestone and hourly work all behave differently. Try each in a trial and confirm the reports show true margin by engagement.",
      },
      {
        heading: "Give clients a clean place to work",
        body: "Decide whether clients will use your portal, a shared workspace or email, and test the guest experience, not just the internal view.",
      },
      {
        heading: "Watch seat costs as headcount grows",
        body: "Per-user prices compound across several tools. Add up the total per employee per month for your full stack before committing.",
      },
    ],
    recommendedCategorySlugs: ["crm-software", "project-management", "accounting-software", "collaboration-software", "document-management"],
    faq: [
      { q: "Should we use one suite or best-of-breed tools?", a: "A suite reduces integration work and gives one invoice, while separate tools allow you to pick the best option for each job. Smaller firms often benefit from fewer, broader tools." },
      { q: "How do we measure utilisation?", a: "Compare billable hours to available hours per person. Make sure your time-tracking tool and calendar model leave and public holidays correctly." },
      { q: "Is free software enough for a solo consultant?", a: "It can be, particularly for CRM and project tracking, but check limits on contacts, projects and branding, and make sure you can export your data." },
      { q: "What if a vendor claims to be the best?", a: "Treat superlatives as marketing. Faresolution shows no ratings in this build, so compare on your own criteria and trial each tool." },
    ],
    seoTitle: "Software for Consultancies and Professional Services Firms",
    seoDescription: "Choose CRM, project, accounting, collaboration and document tools for professional services firms, with advice on time tracking, billing and client work.",
  },
];
