import type { Article } from "../types";
import { callout, h2, h3, p, ul } from "./article-blocks";

export const buyingGuideArticles: Article[] = [
  {
    kind: "buying-guide",
    slug: "how-to-choose-accounting-software",
    title: "How to choose accounting software for a growing business",
    seoTitle: "How to choose accounting software",
    excerpt:
      "What to settle before you compare products: your accountant's role, the transactions you handle, tax and regional fit, reconciliation, reporting and the point at which a small-business tool stops being enough.",
    authorSlug: "daniel-whitfield",
    categoryLabel: "Buying guide",
    publishedAt: "2025-06-04",
    updatedAt: "2026-04-08",
    relatedProductSlugs: ["quickbooks-online", "xero", "freshbooks", "netsuite", "odoo"],
    relatedCategorySlugs: ["accounting-software", "erp-software"],
    featured: false,
    cover: {
      src: "/images/articles/how-to-choose-accounting-software.webp",
      alt: "Symmetrical twin ledger columns balanced above a geometric fulcrum.",
    },
    body: [
      p(
        "Accounting software is the system of record for your finances, so a poor choice is expensive to unwind. The market ranges from lightweight invoicing tools for freelancers to full financial platforms for larger organisations. The right pick depends less on a feature list than on who does the bookkeeping, what you sell and where you operate.",
      ),
      h2("Start with who will use it"),
      p(
        "Decide who will do the day-to-day work: you, an in-house bookkeeper or an external accountant. Ask your accountant which tools they work with and whether they can access your books directly. Many accountants have strong preferences, and aligning with them can save fees and friction at year-end.",
      ),
      p(
        "If you are a non-accountant managing invoices yourself, ease of use matters more. If a finance professional is in charge, depth in reconciliation, reporting and controls matters more.",
      ),
      h2("Map the transactions you actually handle"),
      ul(
        "Do you invoice customers, and do you need recurring invoices, deposits or progress billing?",
        "Do you hold stock, or sell services only?",
        "Do you trade in more than one currency?",
        "Do you pay contractors or staff through the system, or elsewhere?",
        "Do you need to track time or expenses against clients or projects?",
        "Do you accept online payments, and which payment providers do you use?",
      ),
      p(
        "Your answers sort the field quickly. A services business that bills by the hour may prefer a product with time tracking and invoicing at its core, such as the ones aimed at freelancers and small agencies. A business with stock, multiple entities or complex purchasing may need to look at ERP-style products.",
      ),
      h2("Check regional and tax fit"),
      p(
        "Accounting rules, tax types and payroll obligations differ by country. Confirm that the product supports your tax system, produces the reports your authorities expect and handles your local bank connections. Plan names, features and prices often vary by country for the same product, so check the version sold in your region.",
      ),
      callout(
        "Ask your accountant, not the sales page",
        "Whether a product satisfies a local filing requirement is a question for a qualified accountant in your country. Faresolution does not provide tax or accounting advice.",
      ),
      h2("Evaluate the core workflows in a trial"),
      h3("Bank feeds and reconciliation"),
      p(
        "Reconciliation is the task you will do most often, so test it with real bank data. Check how the product suggests matches, how it handles splits and how easy it is to correct a mistake.",
      ),
      h3("Invoicing and getting paid"),
      p(
        "Create a real invoice, send it and apply a payment. Check how reminders work, whether customers can pay online and how credit notes are handled.",
      ),
      h3("Reporting"),
      p(
        "Run the reports you or your accountant need: profit and loss, balance sheet, aged receivables. Check whether you can filter by project, class or location if you need to, and export to a spreadsheet.",
      ),
      h2("Count the total cost"),
      p(
        "Subscription price is only one part. Add-ons for payroll, inventory or additional users can change the total materially. Consider the cost of a bookkeeper's time, a one-off set-up or migration, and any payment-processing fees.",
      ),
      ul(
        "Plan limits on users, invoices, bills or bank connections.",
        "Add-on modules and per-user fees.",
        "Transaction fees for online payments.",
        "Accountant or bookkeeper seats, and whether they are free.",
        "Setup, migration and training time.",
      ),
      h2("Plan for growth"),
      p(
        "Ask what you will do when you outgrow the product. Can you move to a higher plan, and how does the price change? Can you export your chart of accounts, transactions and attachments cleanly? Products at the entry level are easy to start with but not always easy to leave, so check export early.",
      ),
      p(
        "At the other end, an ERP-style system can handle multiple entities, complex purchasing and inventory, but it brings implementation effort and administration that a small business may not need yet. Choose for the next two or three years, not for the largest company you might become.",
      ),
      h2("A simple checklist"),
      ul(
        "Confirm your accountant can work with the product.",
        "Confirm it supports your country's tax and bank connections.",
        "Run reconciliation, invoicing and reporting scenarios on real data.",
        "Add up the realistic total cost for twelve months.",
        "Test a data export before you commit.",
      ),
      p(
        "Use the accounting software category page to see the products listed on Faresolution and compare two or three side by side. Remember that all product details here are unverified sample data, so confirm anything that matters with the vendor.",
      ),
    ],
  },
  {
    kind: "buying-guide",
    slug: "hr-and-payroll-software-buying-guide",
    title: "HR and payroll software: what to settle before you buy",
    seoTitle: "HR and payroll software buying guide",
    excerpt:
      "HR and payroll tools hold your most sensitive data and affect everyone's pay. A guide to scoping the need, understanding compliance responsibilities, testing a pay run and checking access controls.",
    authorSlug: "priya-raman",
    categoryLabel: "Buying guide",
    publishedAt: "2026-07-01",
    updatedAt: "2026-07-01",
    relatedProductSlugs: ["bamboohr", "gusto", "adp-workforce-now", "greenhouse"],
    relatedCategorySlugs: ["hr-software", "payroll-software", "recruiting-software"],
    featured: false,
    cover: {
      src: "/images/articles/hr-and-payroll-software-buying-guide.webp",
      alt: "Modular roster and payroll cycle grid with highlighted pay-run anchor tiles.",
    },
    body: [
      p(
        "HR and payroll software touches every employee, holds some of the most sensitive records a company keeps and affects whether people are paid correctly and on time. That raises the stakes for the buying process. This guide covers what to define before you shortlist, what to test and what to ask.",
      ),
      h2("Decide which problem you are solving"),
      p(
        "\"HR software\" covers several different jobs, and products are often strong in one and basic in the others. Separate your needs into groups:",
      ),
      ul(
        "Core HR: employee records, org charts, documents and onboarding.",
        "Payroll: calculating pay, deductions and tax, and paying employees.",
        "Time and leave: timesheets, shift schedules and time-off requests.",
        "Recruiting: job posts, candidate pipelines and interview feedback.",
        "Benefits and performance: enrolment, reviews and goals.",
      ),
      p(
        "Some vendors offer one platform covering several groups, while others specialise. A combined product reduces duplicate data entry, though a specialised tool may be stronger at its single job. Decide which trade-off suits you.",
      ),
      h2("Understand who carries the compliance responsibility"),
      p(
        "Payroll is regulated. Tax filing, social contributions, minimum wage rules and record retention vary by country and sometimes by state or region. Ask each vendor precisely what it handles for you and what remains your responsibility.",
      ),
      ul(
        "Does the product calculate and file taxes, or only calculate them?",
        "In which countries does it run payroll natively, and how does it handle employees in other countries?",
        "Is there a payroll service provider involved, and who is liable for errors?",
        "How are legislative changes applied, and how will you be told?",
      ),
      callout(
        "Regional availability matters",
        "Many HR and payroll products are built for particular countries. A product with a strong reputation in one market may not support yours at all, so check this first.",
      ),
      h2("Test a pay run before you commit"),
      p(
        "Payroll errors damage trust quickly. In a trial or sandbox, set up a handful of representative employees, including the awkward ones: part-time, hourly, salaried with a bonus, someone with deductions, someone who started mid-period. Run a pay cycle in test mode and compare the outputs against your current payroll.",
      ),
      h3("What to check"),
      ul(
        "Gross-to-net calculations against your own records.",
        "Handling of unpaid leave, overtime and corrections.",
        "Payslip format and how employees access it.",
        "Approval steps before money moves, and who can approve.",
        "Reports for your accountant and for year-end filings.",
      ),
      h2("Check access control and data handling"),
      p(
        "Employee records include addresses, bank details, identification numbers and sometimes health information. Review how the product limits who can see what.",
      ),
      ul(
        "Can managers see only their own team's records?",
        "Can sensitive fields, such as salary, be restricted to specific roles?",
        "Is multi-factor authentication available and enforceable?",
        "Is there an audit trail showing who viewed or changed records?",
        "Where is data stored, and what is the process for deletion when an employee leaves?",
      ),
      p(
        "Pair this with the security questionnaire basics covered elsewhere on Faresolution, and ask about any data processing agreement you may need.",
      ),
      h2("Think about the employee experience"),
      p(
        "Employees will use the product to see payslips, request leave and update their details. If the self-service experience is clumsy, HR will end up handling those requests by email, and the software will have saved little. Have a few non-HR staff try the employee view during the trial, on mobile as well as desktop.",
      ),
      h2("Integrations and cost"),
      p(
        "Payroll needs to connect to accounting so journals post correctly. HR tools often need to connect to chat, calendar and identity systems for onboarding and offboarding. Confirm that each connection exists for the specific products you use, and that the integration works in the direction you need.",
      ),
      p(
        "On cost, find out how pricing scales: per employee, per pay run or by plan, and whether add-ons such as time tracking or benefits administration are priced separately. Ask for a written quote for your actual headcount.",
      ),
      h2("Questions to put to every vendor"),
      ul(
        "Which countries and pay frequencies are supported natively?",
        "Who files taxes and who is liable if a filing is wrong?",
        "Which reports will our accountant receive, and in which formats?",
        "What support is available around pay days, and through which channel?",
      ),
      h2("Switching mid-year"),
      p(
        "Changing payroll providers partway through a tax year requires carrying over year-to-date figures accurately. Many teams prefer to switch at a year boundary or quarter end. Ask the vendor what the migration process involves and whether they provide help with it.",
      ),
    ],
  },
  {
    kind: "buying-guide",
    slug: "how-to-choose-customer-support-software",
    title: "How to choose help desk and customer support software",
    seoTitle: "How to choose customer support software",
    excerpt:
      "From shared inbox to full ticketing platform: how to size your support needs, evaluate channels and automation, judge AI features carefully and understand how support pricing is structured.",
    authorSlug: "daniel-whitfield",
    categoryLabel: "Buying guide",
    publishedAt: "2026-10-28",
    updatedAt: "2026-10-28",
    relatedProductSlugs: ["zendesk", "freshdesk", "intercom", "tidio"],
    relatedCategorySlugs: ["customer-support", "help-desk", "ai-chatbots"],
    featured: false,
    cover: {
      src: "/images/articles/how-to-choose-customer-support-software.webp",
      alt: "Central support intake hub branching into three structured priority lanes.",
    },
    body: [
      p(
        "Customer support software ranges from a shared inbox that keeps messages from getting lost to a platform that handles tickets, live chat, social channels, a help centre and automation. Buying more than you need adds cost and complexity, and buying less leaves customers waiting. This guide helps you size the need and test the options.",
      ),
      h2("Know your support shape first"),
      p(
        "Before looking at products, describe how support works today in a few facts you can gather yourself: which channels customers use, who answers, how requests are tracked and where they get dropped.",
      ),
      ul(
        "Channels: email, chat, phone, social media, in-product messaging.",
        "Team: a single person, a small group or multiple specialised teams.",
        "Volume pattern: steady, or spiky around launches and seasonal events.",
        "Complexity: quick answers, or multi-step investigations that involve other teams.",
        "Self-service: whether customers could solve common issues from articles if they existed.",
      ),
      h2("Match the product type to the need"),
      h3("Shared inbox"),
      p(
        "Suits very small teams. You need assignment, internal notes and a way to avoid two people answering the same message.",
      ),
      h3("Ticketing and help desk"),
      p(
        "Suits teams who need status tracking, priorities, service-level targets, reporting and collaboration across departments.",
      ),
      h3("Messaging and live chat"),
      p(
        "Suits teams who want real-time conversations with website or app visitors. Check how conversations convert to tickets and how out-of-hours messages are handled.",
      ),
      h3("Suite or platform"),
      p(
        "Combines several of the above plus a knowledge base and often sales or engagement tools. It can reduce the number of systems but may bring more setup than you need on day one.",
      ),
      h2("Evaluate the features that affect daily work"),
      ul(
        "Routing and assignment: can requests reach the right person automatically?",
        "Macros and saved replies: can agents answer common questions quickly?",
        "Internal notes and collaboration: can an agent pull in an engineer without losing context?",
        "Customer context: can the agent see previous conversations and relevant account details?",
        "Reporting: first response time, resolution time and volume trends, with filters you can use.",
        "Help centre: is there a knowledge base, and can articles be suggested to customers and agents?",
      ),
      h2("Be careful with AI claims"),
      p(
        "Many support products now offer AI features, such as suggested replies, summaries and automated answers to customers. These can be useful, but treat them as something to test rather than assume. Ask how the AI is trained on your content, how it behaves when it does not know the answer, whether a customer can easily reach a person and how its usage is priced.",
      ),
      callout(
        "Test with your hardest questions",
        "Put real, difficult customer questions through any automated answering feature during the trial, not just easy ones. Check that wrong or uncertain answers are handled safely and that your team can review what customers were told.",
      ),
      h2("Understand how pricing is structured"),
      p(
        "Support products are commonly priced per agent, with tiers that unlock automation, reporting and customisation. Some add charges based on conversations, resolutions or contacts, especially for messaging and AI features. Ask for a quote that matches your headcount and expected volume.",
      ),
      ul(
        "Are occasional agents or collaborators charged as full seats?",
        "Which tier includes service-level tracking, advanced reporting and custom roles?",
        "Are chat, phone or AI features separately priced?",
        "What happens to costs in your busiest month?",
      ),
      h2("Check integrations and migration"),
      p(
        "Support works best when it can see customer data from your CRM, ecommerce platform or product. Check for connectors to the systems you use. If you are moving from another tool, ask how historical tickets and customer records will be imported and whether the import preserves conversation threads.",
      ),
      h2("Plan the first month"),
      p(
        "Whatever you choose, expect the first weeks to be about setup rather than speed. Import your existing articles and saved replies, connect the channels customers already use and agree simple tagging rules so that reporting is meaningful from the start. Resist building elaborate automation before you have seen real traffic flow through the system.",
      ),
      h2("Run a short pilot"),
      p(
        "Choose two or three products and run a pilot with the agents who answer the questions every day. Give them the same set of recent real requests and ask them to handle them end to end. Compare how quickly they can find context, respond and close, and ask them which tool they would rather use. The people who live in the tool all day are the best evaluators you have.",
      ),
      p(
        "Use the customer support category page and the comparison tool on Faresolution to line up options, and verify details with the vendors, since the product data here is unverified sample content.",
      ),
    ],
  },
];
