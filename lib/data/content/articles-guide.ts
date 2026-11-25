import type { Article } from "../types";
import { callout, h2, h3, p, ul } from "./article-blocks";

export const guideArticles: Article[] = [
  {
    kind: "guide",
    slug: "how-to-run-a-software-trial",
    title: "How to run a software trial that actually tells you something",
    excerpt:
      "Most trials fail because nobody defined what success looks like. A step-by-step method for turning a free trial into evidence you can use to make the decision.",
    authorSlug: "daniel-whitfield",
    categoryLabel: "Evaluation",
    publishedAt: "2025-04-22",
    updatedAt: "2026-02-10",
    relatedProductSlugs: ["hubspot-crm", "asana", "zendesk", "quickbooks-online"],
    relatedCategorySlugs: ["crm-software", "project-management", "customer-support"],
    featured: true,
    body: [
      p(
        "A free trial is the single best source of evidence a software buyer gets, and most teams waste it. They sign up, click around the demo data for an afternoon, decide it looks fine, and let the trial lapse. A month later they are either committed to a tool they never properly tested or starting the search again.",
      ),
      p(
        "A trial works when you treat it as a small experiment with a hypothesis, a deadline and a way of judging the result. This guide walks through that method.",
      ),
      h2("Before the trial starts"),
      h3("Write three to five scenarios"),
      p(
        "A scenario is a real task, described from start to finish, that someone on your team does regularly. For a CRM: a lead arrives from the website, gets assigned, is contacted twice, becomes a deal and is closed. For accounting: a customer invoice is raised, partly paid and reconciled against a bank line.",
      ),
      p(
        "Pick scenarios that are frequent and scenarios that are painful today. The frequent ones tell you whether daily work will be smooth. The painful ones tell you whether the new tool fixes the reason you are looking.",
      ),
      h3("Choose the testers"),
      p(
        "Include at least one person who will use the tool every day and one who is skeptical. Avoid trials run only by the champion or only by a manager who will never touch the software again. Give each tester specific scenarios so that the work is divided and nobody assumes someone else covered it.",
      ),
      h3("Check the trial terms"),
      ul(
        "How long does the trial last, and can it be extended if you ask?",
        "Is the trial the full product, or a restricted version with features switched off?",
        "Is a payment card required, and does the trial convert to a paid plan automatically?",
        "Will your trial data carry over if you buy, or does it get wiped?",
      ),
      h2("During the trial"),
      h3("Use real data, in small quantity"),
      p(
        "Demo data is designed to look good. Import a realistic sample of your own records instead: a few dozen contacts, a handful of projects, last month's invoices. Messy data exposes how the tool handles duplicates, odd characters, custom fields and long text.",
      ),
      p(
        "Keep the sample small enough that you can compare results by eye. If sensitive data is involved, anonymise it first and confirm the vendor's data handling terms before uploading anything real.",
      ),
      h3("Time the scenarios"),
      p(
        "Ask each tester to note roughly how long each scenario took and where they got stuck. You are not measuring speed for its own sake. You are looking for friction: a step that requires three screens, a setting nobody could find, a report that cannot be filtered the way you need.",
      ),
      h3("Test the unglamorous parts"),
      ul(
        "Permissions: can you stop one team from seeing another team's records?",
        "Integrations: does the connection to your email, calendar or accounting tool actually sync what you expect, in both directions?",
        "Export: can you get your data out in a usable format?",
        "Mobile: if people work away from a desk, try the mobile app on a real phone.",
        "Support: ask the vendor a real question and note how quickly and how clearly they answer.",
      ),
      callout(
        "Do not trial the sales demo",
        "A guided demo shows the product at its best with prepared data. It is useful for orientation, but it is not a substitute for your own testers running your own scenarios.",
      ),
      h2("Scoring the result"),
      p(
        "At the end of the trial, gather the testers for a short review. For each scenario, record whether it was completed, how hard it was and what the workaround was if it failed. A simple three-point scale (works, works with effort, does not work) is enough and avoids false precision.",
      ),
      p(
        "Then separate the findings into three groups: deal-breakers, things you can live with and things a vendor conversation could fix. Raise the third group with the vendor directly. How they respond to a concrete problem is itself useful information about what support will feel like after you sign.",
      ),
      h2("Common mistakes"),
      ul(
        "Trialling five tools at once with no shared scenarios, which makes the results impossible to compare.",
        "Letting the trial run into the busiest week of the quarter when nobody has time to test.",
        "Judging on design alone. A pleasant interface matters, but a tool that handles your edge cases matters more.",
        "Forgetting to cancel or downgrade, then paying for a plan nobody chose.",
      ),
      h2("What to do when the trial ends"),
      p(
        "If a tool clearly passes your scenarios, ask for a written quote that includes the exact plan, number of users and any add-ons you need, plus the renewal terms. If two tools are close, ask for a short trial extension and repeat only the scenarios where they differed.",
      ),
      p(
        "If nothing passes, that is a useful result too. Revisit the scenarios and ask whether the requirement is genuinely necessary or whether the process itself should change before you buy anything.",
      ),
    ],
  },
  {
    kind: "guide",
    slug: "software-data-migration-checklist",
    title: "A data migration checklist for switching business software",
    excerpt:
      "Moving from one system to another is where most of the risk in a software change sits. A practical checklist covering scoping, cleaning, mapping, test runs and the cutover itself.",
    authorSlug: "priya-raman",
    categoryLabel: "Implementation",
    publishedAt: "2025-09-03",
    updatedAt: "2025-09-03",
    relatedProductSlugs: ["quickbooks-online", "xero", "hubspot-crm", "zoho-crm"],
    relatedCategorySlugs: ["accounting-software", "crm-software", "erp-software"],
    featured: false,
    body: [
      p(
        "Choosing new software is the visible part of a change. Moving your data across is the part that decides whether the change succeeds. Customer histories, invoices, tickets and documents were created under the rules of the old system, and the new system will interpret them under different rules. A little planning prevents the most common problems: missing history, broken links between records and a team that loses trust in the numbers.",
      ),
      h2("Step 1: decide what actually needs to move"),
      p(
        "Not everything deserves a place in the new system. Start by listing each kind of record you hold and give it one of three labels: migrate fully, migrate in summary, or archive outside the system.",
      ),
      ul(
        "Migrate fully: live records you work with daily, such as open deals, active customers, current employees and unpaid invoices.",
        "Migrate in summary: old history you only need for reference, such as prior-year totals or closed-won deal values.",
        "Archive: records kept for legal or audit reasons that nobody edits. A well-labelled export in a secure location is often enough.",
      ),
      p(
        "Check your record-retention obligations before deleting anything. Requirements differ by country and by industry, so ask your accountant or legal adviser rather than guessing.",
      ),
      h2("Step 2: clean before you move"),
      p(
        "Migrating dirty data only reproduces the mess in a more expensive tool. Spend time on the obvious problems first: duplicate contacts, inconsistent company names, outdated statuses, empty required fields and test records.",
      ),
      h3("A quick cleaning pass"),
      ul(
        "Sort each key field and look for variants of the same value (for example, three spellings of one company).",
        "Search for blank values in fields the new system will require.",
        "Standardise dates, phone numbers and country names to a single format.",
        "Remove records that nobody has touched and nobody needs.",
      ),
      h2("Step 3: map fields and relationships"),
      p(
        "A mapping document lists each field in the old system next to its destination in the new one. Include the type of each field, because a free-text field mapped to a dropdown will fail or silently drop values.",
      ),
      p(
        "Pay particular attention to relationships: which contact belongs to which company, which invoice belongs to which customer, which comment belongs to which ticket. Ask how the new system identifies a record, and whether you can carry over the old identifier in a reference field so you can trace anything back later.",
      ),
      callout(
        "Watch for lossy fields",
        "Attachments, comment threads, activity history, custom fields and user mentions are the items most often dropped or flattened in a migration. Ask the vendor or the import tool to confirm in writing what carries over before you commit.",
      ),
      h2("Step 4: run a test migration"),
      p(
        "Run the import on a small, representative sample into a sandbox or trial account before touching the real thing. Choose records that include your awkward cases: very long text, special characters, records with many related items and records with missing values.",
      ),
      p(
        "Then verify. Compare record counts per type in both systems, spot-check a sample against the original by eye, and have an everyday user open the records and confirm they look right. For financial data, reconcile totals such as the outstanding balance against the old system's report.",
      ),
      h2("Step 5: plan the cutover"),
      h3("Choose the window"),
      p(
        "Pick a quiet period rather than month-end, payroll week or a campaign launch. Decide whether you will freeze changes in the old system during the move or run a short parallel period.",
      ),
      h3("Define the rollback"),
      p(
        "Keep the old system available, read-only if possible, until you are confident. Write down the conditions under which you would roll back and who makes that decision. A rollback you never use is cheap, and one you need but never planned is not.",
      ),
      h3("Tell the people affected"),
      p(
        "Give users the date, a short guide to what is different and a named person to ask. Integrations also need attention: any tool that reads from or writes to the old system must be reconnected, and automations that rely on old identifiers must be tested.",
      ),
      h2("Step 6: after the move"),
      ul(
        "Run the same reconciliation checks a week and a month after cutover.",
        "Keep a list of issues users report and look for patterns that point to mapping errors.",
        "Do not decommission the old system until your next financial close or audit cycle has passed.",
        "Export a final copy of the old data and store it securely before you cancel the subscription.",
      ),
      p(
        "A migration rarely goes perfectly, but a migration that was scoped, cleaned, mapped and rehearsed tends to fail in small, fixable ways rather than large, surprising ones.",
      ),
    ],
  },
  {
    kind: "guide",
    slug: "security-questionnaire-basics-for-small-teams",
    title: "Security questionnaire basics for small teams buying software",
    excerpt:
      "You do not need a security department to ask sensible questions of a software vendor. A short list covering access control, data handling, incident response and what documents to request.",
    authorSlug: "elena-marchetti",
    categoryLabel: "Security",
    publishedAt: "2026-01-14",
    updatedAt: "2026-01-14",
    relatedProductSlugs: ["okta", "1password", "crowdstrike-falcon"],
    relatedCategorySlugs: ["cybersecurity"],
    featured: false,
    body: [
      p(
        "Every piece of business software you adopt becomes part of your security surface. It holds your data, authenticates your people and may connect to other systems you rely on. Large companies handle this with long vendor questionnaires and dedicated teams. Smaller teams can get most of the value from a much shorter list, asked consistently of every vendor.",
      ),
      p(
        "This guide covers what to ask, what good answers tend to look like and what documents to request. It is general guidance and not legal or compliance advice.",
      ),
      h2("Start with what data the tool will hold"),
      p(
        "The right level of scrutiny depends on the data. A tool that holds public marketing copy needs a lighter review than one that holds customer personal data, payment-related records or employee files. Write a one-line description of the most sensitive data the tool will see before you send any questions.",
      ),
      p(
        "If personal data is involved, check which laws apply to you and whether the vendor offers a data processing agreement. This is something to raise with a qualified adviser if you are unsure.",
      ),
      h2("Access control questions"),
      p(
        "Stolen, phished or reused credentials are among the most common ways accounts are compromised, so access features deserve the most attention.",
      ),
      ul(
        "Does the product support multi-factor authentication, and can an administrator require it for everyone?",
        "Does it support single sign-on with your identity provider, and on which plan?",
        "Are permissions role-based, and can you limit what each role can view, edit and export?",
        "Can you see an audit log of sign-ins and changes, and how long is it kept?",
        "How quickly can you remove a departed employee's access, and is that automated if you use single sign-on?",
      ),
      callout(
        "Check which plan includes the controls",
        "Single sign-on, audit logs and advanced permissions are frequently reserved for higher plans. Confirm they are included in the plan you intend to buy, not just the one on the feature page.",
      ),
      h2("Data handling questions"),
      h3("Where and how is data stored?"),
      p(
        "Ask in which regions data is stored, whether you can choose a region, and whether data is encrypted in transit and at rest. If you have contractual or regulatory constraints on location, get the answer in writing.",
      ),
      h3("What happens to the data over time?"),
      ul(
        "How long is data retained after you delete it, and in backups?",
        "What happens to your data if you cancel? Is there a defined deletion process and timeline?",
        "Can you export all of your data in a standard format?",
        "Does the vendor use customer data to train its own models or share it with third parties, and can that be switched off?",
      ),
      h3("Who else touches the data?"),
      p(
        "Vendors usually rely on their own suppliers, such as cloud hosting and email delivery. Ask for the list of subprocessors, or whether the vendor publishes one, and how it notifies customers when the list changes.",
      ),
      h2("Operations and incident response"),
      ul(
        "Is there a documented process for responding to security incidents, and how quickly will you be notified of one that affects your data?",
        "How are vulnerabilities reported and fixed? Is there a public contact for researchers?",
        "How are backups handled, and have restores been tested?",
        "Is there a public status page and a history of incidents?",
      ),
      p(
        "A vendor that answers these confidently and consistently is usually practiced at it. Vague or defensive answers do not prove a problem, but they are a reason to ask follow-up questions.",
      ),
      h2("Documents worth requesting"),
      p(
        "Ask what independent assurance the vendor has. Common examples include reports or certifications from external audits against recognised security standards. Treat these as a starting point: check the date, what scope the audit covered and whether the product you are buying was within that scope.",
      ),
      ul(
        "The vendor's security overview or trust page.",
        "Any independent audit report or certification and its scope.",
        "The data processing agreement and subprocessor list.",
        "The terms covering liability, breach notification and data return.",
      ),
      h2("Keep it proportionate"),
      p(
        "A five-person team buying a note-taking app does not need to run a full vendor audit. A simple routine is enough: classify the data, ask the access and data-handling questions above, read the trust page and keep the answers in a shared document. Repeat the review when the vendor changes ownership, when your use of the tool expands to more sensitive data, or at renewal.",
      ),
    ],
  },
  {
    kind: "guide",
    slug: "automate-a-business-process-without-breaking-it",
    title: "How to automate a business process without breaking it",
    excerpt:
      "Automation platforms make it easy to connect apps, and just as easy to automate a mess. A guide to mapping the process first, starting small and building in error handling.",
    authorSlug: "priya-raman",
    categoryLabel: "Automation",
    publishedAt: "2026-05-06",
    updatedAt: "2026-05-06",
    relatedProductSlugs: ["zapier", "make", "n8n", "slack"],
    relatedCategorySlugs: ["workflow-automation", "collaboration-software"],
    featured: false,
    body: [
      p(
        "Workflow automation platforms connect the apps you already use so that work moves between them without someone copying and pasting. Done well, they remove dull, error-prone steps. Done carelessly, they spread bad data faster than a person ever could and fail in ways nobody notices until a customer complains.",
      ),
      p(
        "The tooling matters less than the order of work. Process first, platform second.",
      ),
      h2("Step 1: map the manual process"),
      p(
        "Before choosing a tool, write down how the work happens today. Use plain steps: who does what, in which system, triggered by what, producing what. Include the exceptions people handle without thinking, such as \"if the order is from an existing customer, skip step three\".",
      ),
      p(
        "This map often shows that a step you wanted to automate is unnecessary, or that two people are doing the same job. Removing a step is cheaper than automating it.",
      ),
      h2("Step 2: pick a first process with the right profile"),
      p(
        "The best first candidates are frequent, rule-based and low-risk. A new form submission that should create a CRM record and notify a channel is a good example. Poor first candidates involve money movement, legal commitments or judgement calls that vary case by case.",
      ),
      ul(
        "Frequent: it happens often enough to repay the setup time.",
        "Rule-based: you can state the decision rules without saying \"it depends\".",
        "Reversible: a mistake can be corrected without lasting harm.",
        "Observable: you can tell quickly whether it worked.",
      ),
      h2("Step 3: choose a platform by how you will maintain it"),
      p(
        "Several products in this space take different approaches. Zapier is known for a very large catalogue of prebuilt connectors and a straightforward editor. Make uses a visual canvas that suits branching, multi-step scenarios. n8n offers a self-hostable option aimed at technical teams that want more control over where workflows run.",
      ),
      p(
        "Rather than ranking them, ask who will maintain the automations after they are built. If a non-technical operations person will own them, ease of use and clear run history matter most. If an engineer will, flexibility, version control and hosting options may matter more.",
      ),
      h3("Questions that separate the options"),
      ul(
        "Does it have a connector for each app in the process, including the specific actions you need (not just the app name)?",
        "How is usage priced: per task, per execution, per workflow or per user? Estimate your volume against that unit.",
        "Can you see a log of every run, with inputs and outputs, and replay a failed one?",
        "Can several people edit and review workflows, and is there a way to test without touching live data?",
      ),
      h2("Step 4: build small and test with real cases"),
      p(
        "Build the simplest version that handles the common case, then test it with real examples, including the odd ones: a missing field, a very long name, a duplicate submission, an unexpected character. Run it in a test environment or against a copy of the destination system where possible.",
      ),
      callout(
        "Make a person the fallback",
        "Route anything the automation cannot handle to a human, for example by posting it to a review channel, rather than letting it fail silently or guess.",
      ),
      h2("Step 5: add error handling and ownership"),
      p(
        "Every automation will fail eventually, because an app changes its interface, a credential expires or a field is left blank. Decide in advance what happens: who is alerted, how, and what they should do.",
      ),
      ul(
        "Turn on failure notifications that go to a shared channel or mailbox, not one person's inbox.",
        "Name an owner for each workflow and record what it does in one sentence.",
        "Store credentials in a shared, managed account rather than a personal one, so the automation does not die when someone leaves.",
        "Document the trigger, the steps and the destination so that someone else can fix it.",
      ),
      p(
        "A short written runbook helps here. For each workflow, note the trigger, the apps involved, what a failure looks like and the first thing to check. Five lines is enough, and it turns an outage from a mystery into a routine fix.",
      ),
      h2("Step 6: review on a schedule"),
      p(
        "Revisit your automations every few months. Retire the ones nobody needs, check that run volume still fits your pricing plan and confirm that the underlying process has not changed. An automation built around last year's process is a quiet source of errors.",
      ),
      p(
        "Start with one reliable workflow, learn how your chosen platform behaves under real use, and expand only when the first one has been boring for a while. Boring is the goal.",
      ),
    ],
  },
];
