import type { Article } from "../types";
import { callout, h2, h3, p, ul } from "./article-blocks";

export const blogArticles: Article[] = [
  {
    kind: "blog",
    slug: "five-questions-before-adding-another-saas-tool",
    title: "Five questions to ask before you add another software tool",
    excerpt:
      "Every new subscription adds logins, data copies and renewal dates. Five plain questions that help you decide whether a new tool earns its place or whether an existing one can do the job.",
    authorSlug: "priya-raman",
    categoryLabel: "Software strategy",
    publishedAt: "2025-03-18",
    updatedAt: "2025-03-18",
    relatedProductSlugs: ["notion", "slack", "zapier", "asana"],
    relatedCategorySlugs: ["collaboration-software", "workflow-automation", "project-management"],
    featured: false,
    body: [
      p(
        "Most businesses do not decide to own thirty subscriptions. They arrive there one reasonable purchase at a time: a form builder for a campaign, a second chat app because a client prefers it, a note-taking tool a new hire brought along. Each choice made sense on the day. The cost shows up later, as scattered data, overlapping features and a renewal calendar nobody owns.",
      ),
      p(
        "Before you start a trial of anything new, it is worth spending twenty minutes on five questions. None of them requires a spreadsheet. They simply force the purchase to justify itself against what you already pay for.",
      ),
      h2("1. What exact job is this tool being hired to do?"),
      p(
        "Write the job as a sentence with a verb and an outcome: \"Track every open deal and show the owner what happens next\", or \"Give the finance team one place to approve invoices\". If the best sentence you can produce is \"improve collaboration\" or \"get more visibility\", the need is not yet clear enough to buy against.",
      ),
      p(
        "A well-formed job statement also gives you a test for the trial later. You can ask a real colleague to do that job in the tool and see whether it works, rather than clicking through demo data.",
      ),
      h2("2. Do we already own a tool that nearly does it?"),
      p(
        "Check the plans you already pay for before looking outward. Many suites quietly include a basic version of the feature you want: a lightweight task board inside a chat tool, a form feature inside your spreadsheet suite, a simple automation builder inside your CRM.",
      ),
      p(
        "A built-in feature is often less polished than a specialist product, but it comes with no new login, no new data silo and no new vendor review. If it covers most of the job statement from question one, the remaining gap needs to be a real, named pain point to justify a new purchase.",
      ),
      h3("How to check quickly"),
      ul(
        "Open the admin page of each major tool and read the list of features on your current plan, not the marketing page.",
        "Ask the person who administers the tool whether an unused feature exists; admins often know about options that never got announced to staff.",
        "Search your shared drive for the last time someone solved this problem and note which tool they used.",
      ),
      h2("3. Where will the data live, and how does it get out?"),
      p(
        "Every tool that holds business records becomes part of your system of record. Ask where the authoritative copy of each kind of data sits, whether the new tool will create a second copy, and who is responsible for keeping them in sync.",
      ),
      p(
        "Also check exit before you enter. Can you export everything, including attachments, comments and history, in a format another system can read? Is export available on the plan you will actually buy? A tool that is easy to adopt and hard to leave is not automatically a bad choice, but you should be choosing that trade knowingly.",
      ),
      callout(
        "Test the export on day one",
        "During the trial, export a small set of real records and open the file. A fifteen-minute test now is far cheaper than discovering at renewal time that attachments or comment history do not come out.",
      ),
      h2("4. Who owns it after the person who wanted it moves on?"),
      p(
        "Tools tend to have a champion during selection and no owner afterwards. Name an administrator before you sign: someone who manages users, handles renewals and decides what is allowed in the tool. Name a backup too.",
      ),
      p(
        "Without an owner, the usual failures follow. Former employees keep access, the plan quietly grows as people are added, and nobody notices when a feature changes or a price rises. If you cannot name an owner, that is a signal the tool is not important enough to adopt yet.",
      ),
      h2("5. What would make us cancel it?"),
      p(
        "This is the question teams skip, and it is the most useful one. Before you start, agree on what \"not working\" looks like: the team still uses spreadsheets alongside it after a quarter, the setup needs a specialist you do not have, or the integration you depend on breaks twice.",
      ),
      p(
        "Put a review date in the calendar for roughly one renewal cycle ahead. When it arrives, measure against the job statement from question one rather than against how the tool feels. If it has not earned its place, cancel it while cancelling is still easy.",
      ),
      h2("A short decision rule"),
      p(
        "If you can answer all five questions in a few sentences each, the tool is probably worth trialling. If two or more answers are vague, the problem is probably the process rather than the software, and a new subscription will only move the confusion into a different window.",
      ),
      p(
        "None of this argues against buying software. Good tools remove real work. The aim is to make sure each one arrives with a purpose, an owner and an exit plan, so that your stack stays something you manage rather than something that happens to you.",
      ),
    ],
  },
  {
    kind: "blog",
    slug: "what-a-free-plan-is-really-for",
    title: "What a free plan is really for, and when it stops being free",
    excerpt:
      "Free plans are a legitimate way to try software, but they are designed around limits. Learn how to read those limits so the first invoice is not a surprise.",
    authorSlug: "daniel-whitfield",
    categoryLabel: "Pricing",
    publishedAt: "2025-07-09",
    updatedAt: "2026-01-20",
    relatedProductSlugs: ["hubspot-crm", "trello", "mailchimp", "supabase"],
    relatedCategorySlugs: ["crm-software", "project-management", "email-marketing"],
    featured: false,
    body: [
      p(
        "A free plan is a product decision, not a gift. Vendors offer one because it lowers the cost of trying the product, and because some users will grow into paid tiers. That is a fair arrangement, and many small teams run real work on free plans for years. The trouble starts when a team treats the free tier as the permanent answer without checking where its edges are.",
      ),
      p(
        "This article explains the common shapes free plans take and the questions to ask so you are never surprised by the moment you cross a line.",
      ),
      h2("The four common shapes of a free plan"),
      h3("Capped by volume"),
      p(
        "The product works fully, but only up to a quantity: a number of contacts, emails sent, records stored or automated tasks per month. These are the easiest limits to forecast because you can usually count your current usage today.",
      ),
      h3("Capped by people"),
      p(
        "Free for a small number of users, with a price attached to each additional seat. This suits very small teams, but check whether guests, contractors or read-only viewers count as full seats.",
      ),
      h3("Capped by features"),
      p(
        "The core is free and the advanced capabilities sit behind paid tiers. Typical gated items include reporting, automation, permissions, audit logs and single sign-on. Features gated this way are often the ones a growing company needs most.",
      ),
      h3("Capped by time or support"),
      p(
        "Some free offers are really extended trials, and others are permanent but come with community support only. Neither is a problem, as long as you know which one you are using.",
      ),
      h2("Limits that are easy to miss"),
      p(
        "The headline limit is rarely the one that bites. These quieter constraints are worth hunting for in the plan comparison table and the terms:",
      ),
      ul(
        "History and retention: how far back can you search, restore or report?",
        "File and attachment size, and total storage.",
        "Branding: whether the vendor's name or logo is added to pages, forms or emails you send to customers.",
        "Integrations: whether connecting to your other tools requires a paid tier, or whether connected data is capped.",
        "Support: whether you can reach a person at all, and how long you might wait.",
        "Data export: whether you can download everything on the free tier.",
      ),
      callout(
        "Read the limits as a forecast",
        "Do not ask whether the free plan is enough today. Ask what your usage looks like in twelve months if the business goes well, and whether the next tier up is a price you can accept.",
      ),
      h2("How to evaluate a free plan honestly"),
      h3("Step 1: list your must-have features"),
      p(
        "Write down the capabilities the workflow cannot function without. Compare that list against the free tier line by line. A free plan that lacks one must-have is not a free plan for you, it is a trial.",
      ),
      h3("Step 2: estimate growth"),
      p(
        "Count current contacts, users and monthly volume, then add a plausible increase over the coming year. Compare that estimate with the free limits and with the first paid tier's limits. If you would outgrow the free plan within months, plan as though you are buying the paid plan.",
      ),
      h3("Step 3: check the exit"),
      p(
        "The best time to learn how hard it is to leave is while you still have little data in the tool. Export a sample and confirm you can recover your records in a standard format. This matters more on free plans because the vendor has less commercial reason to support your departure.",
      ),
      h2("When staying on a free plan is the right call"),
      p(
        "Free plans are well suited to solo operators, side projects, new teams still working out their process and any situation where the tool is a convenience rather than a system of record. They also make good proving grounds: run a real but small workflow, learn what you need, then choose a paid product with that knowledge.",
      ),
      p(
        "Free plans are a weaker fit when customer data, regulatory records or revenue reporting depend on the tool, or when you need controls such as audit logs and role-based access that vendors commonly reserve for paid tiers.",
      ),
      h2("What this means on Faresolution"),
      p(
        "Where a product page here says a free plan exists, treat it as a pointer rather than a promise. Plan limits change, and the sample data on this site has not been verified with the vendors. Confirm the current limits on the vendor's own pricing page before you build a process on top of them.",
      ),
    ],
  },
];
