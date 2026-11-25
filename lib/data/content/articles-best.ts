import type { Article } from "../types";
import { callout, h2, h3, p, ul } from "./article-blocks";

export const bestSoftwareArticles: Article[] = [
  {
    kind: "best-software",
    slug: "crm-tools-to-shortlist-for-small-sales-teams",
    title: "CRM tools worth shortlisting for small sales teams",
    excerpt:
      "An editor's shortlist of four CRM products to put in your first round of trials, chosen against stated criteria rather than ratings, with notes on who each one suits.",
    authorSlug: "priya-raman",
    categoryLabel: "Best software",
    publishedAt: "2026-03-24",
    updatedAt: "2026-10-15",
    relatedProductSlugs: ["hubspot-crm", "zoho-crm", "pipedrive", "salesforce-sales-cloud"],
    relatedCategorySlugs: ["crm-software", "sales-software"],
    featured: true,
    body: [
      p(
        "This is an editor's shortlist: a set of products worth including in a first round of trials if you run a small sales team and are choosing your first or second CRM. The products are listed in no particular order. They are not ranked, scored or rated.",
      ),
      callout(
        "How to read this list",
        "This shortlist is not based on user reviews yet, and Faresolution has not tested these products hands-on. It reflects the products' publicly documented positioning and the criteria below. Verify current features, limits and prices with each vendor before you decide.",
      ),
      h2("The criteria we used"),
      p(
        "A small team has different priorities from a large enterprise. We looked for products that meet most of the following, judged from what each vendor publicly documents:",
      ),
      ul(
        "A way to start without a large commitment, such as a free plan or free trial.",
        "A clear pipeline view that a salesperson can learn without training.",
        "Email and calendar connections to the tools small teams already use.",
        "A route to grow, through add-ons, higher tiers or an ecosystem of integrations.",
        "Reporting that a manager can use without a data analyst.",
      ),
      p(
        "Cost, support quality and the strength of mobile apps also matter, but we have not verified them, so they are left for your trial scenarios.",
      ),
      h2("The shortlist"),
      h3("HubSpot CRM"),
      p(
        "HubSpot's CRM is widely known for offering free CRM tools alongside paid tiers, and it sits inside a wider platform that includes marketing and service products. It is worth trialling if you want one place for contacts, deals and basic marketing, and if you expect to add other tools from the same vendor later.",
      ),
      p(
        "Things to check: which features sit behind paid tiers, how pricing changes as contact counts or seats grow and how much of the wider platform you would actually use.",
      ),
      h3("Zoho CRM"),
      p(
        "Zoho CRM belongs to a large suite of business applications, so it can suit a team that expects to add accounting, support or inventory tools from the same family. It offers customisation options and automation, and the vendor documents multiple plan levels.",
      ),
      p(
        "Things to check: how the interface feels for daily use, which automation and reporting features are on your tier, and how well it connects to the non-Zoho tools you rely on.",
      ),
      h3("Pipedrive"),
      p(
        "Pipedrive is built around a visual sales pipeline, and is generally positioned at small and mid-sized sales teams that want a straightforward deal-tracking tool. It is a reasonable candidate if your main need is to see every deal and its next step.",
      ),
      p(
        "Things to check: whether the contact and company management is deep enough for your account-based work and which reporting and automation options require higher plans.",
      ),
      h3("Salesforce Sales Cloud"),
      p(
        "Salesforce is among the most established CRM vendors and is known for deep configurability and a large partner ecosystem. It tends to suit organisations with complex sales processes or the capacity to configure and administer the system, and it can scale up with a company.",
      ),
      p(
        "Things to check: the total cost including add-ons and implementation help, the administration effort you can realistically support and whether a simpler tool would meet your needs for the next year or two.",
      ),
      h2("How to choose between them"),
      p(
        "Run the same three scenarios in each trial: capture a lead from your website form, move a deal through your real stages with a follow-up task, and produce the pipeline report your manager wants every Monday. Whichever product lets a typical salesperson do all three with the least friction is a stronger fit than any feature list will show.",
      ),
      h3("If you want the lowest setup effort"),
      p(
        "Favour the product whose default pipeline already resembles your sales process, so you configure less and sell sooner.",
      ),
      h3("If you expect a complex process"),
      p(
        "Favour the product with the configuration depth you need, and budget time and money for an administrator or partner to set it up.",
      ),
      h3("If you want a suite"),
      p(
        "Favour the vendor whose other products you are likely to use, and check that the CRM is good enough on its own, since you may end up using it first and alone.",
      ),
      h2("What is not on this list"),
      p(
        "Many capable CRMs are missing here, including products aimed at particular industries and open-source options. A shortlist is a place to start, not a verdict. Use the CRM category page and the comparison tool on Faresolution to widen or narrow your own list.",
      ),
      p(
        "As reviews and verified vendor data are added to the site, shortlists like this one will be revisited and the criteria will remain published so you can see how they were applied.",
      ),
    ],
  },
  {
    kind: "best-software",
    slug: "project-management-tools-to-shortlist-for-small-teams",
    title: "Project management tools worth shortlisting for small teams",
    excerpt:
      "A criteria-led shortlist of five project and work management products for small teams, with the questions each one is best suited to answer. No rankings and no star ratings.",
    authorSlug: "daniel-whitfield",
    categoryLabel: "Best software",
    publishedAt: "2026-08-12",
    updatedAt: "2026-08-12",
    relatedProductSlugs: ["asana", "trello", "monday-com", "clickup", "jira"],
    relatedCategorySlugs: ["project-management", "collaboration-software"],
    featured: false,
    body: [
      p(
        "Project management is a crowded category, and most products can display tasks on a board. What differs is how each handles planning, workload, reporting and structure as a team grows. This shortlist offers five products that are worth including in a first round of trials, selected against the criteria below. They are presented in no particular order.",
      ),
      callout(
        "Not a ranking",
        "This shortlist is not based on user reviews yet, and Faresolution has not tested the products hands-on. It is an editor's selection from publicly documented positioning. Confirm plans, limits and prices on each vendor's site.",
      ),
      h2("What a small team usually needs"),
      p(
        "Before looking at products, decide which of these your work actually involves. They point toward different tools.",
      ),
      ul(
        "Simple task tracking with owners and due dates.",
        "Visual boards for work that moves through stages.",
        "Timelines or dependencies for work where order matters.",
        "Workload visibility, so one person is not quietly overloaded.",
        "Reporting that a manager or client can read without asking for a status meeting.",
        "Software-development workflows such as sprints and issue tracking.",
      ),
      h2("The shortlist"),
      h3("Asana"),
      p(
        "Asana is a work management product centred on tasks, projects and multiple views, including lists, boards and timelines. It suits teams that coordinate cross-functional work and want structure without building their own system. A free tier for small teams has historically been available, but check current limits.",
      ),
      h3("Trello"),
      p(
        "Trello is known for its simple card-and-board model, which makes it quick to learn. It suits teams whose work flows naturally through stages and who value approachability over depth. As projects become more complex, check how its planning and reporting options compare with what you need.",
      ),
      h3("monday.com"),
      p(
        "monday.com presents work as customisable boards with a range of column types and views. It tends to appeal to teams who want to shape their own workflows and dashboards. Check how seats are packaged, since vendors in this category sometimes sell them in bundles.",
      ),
      h3("ClickUp"),
      p(
        "ClickUp positions itself as an all-in-one work platform with tasks, documents, goals and many views. It can suit teams who want to consolidate several tools. The trade-off to test is whether the breadth feels empowering or overwhelming for your people.",
      ),
      h3("Jira"),
      p(
        "Jira is widely used by software teams for issue tracking and agile workflows. It is a strong candidate if your work is software delivery, and a less natural fit if you need a lightweight tracker for non-technical projects.",
      ),
      h2("Match the product to the work"),
      p(
        "A useful way to narrow the list is to name the dominant type of work and look for the product that was designed around it.",
      ),
      ul(
        "Flow-based work with clear stages: Trello or a board view elsewhere.",
        "Cross-team projects with owners and deadlines: Asana or monday.com.",
        "Teams that want to replace several tools at once: ClickUp, with a careful test of complexity.",
        "Software delivery with sprints and releases: Jira.",
      ),
      h2("Trial scenarios to run in each"),
      h3("Scenario one: a real project, start to finish"),
      p(
        "Set up an actual upcoming project with tasks, owners and dates. Note how long it takes a person who has never seen the product to do so.",
      ),
      h3("Scenario two: a change of plan"),
      p(
        "Move a deadline and reassign work. Check how clearly the tool shows the knock-on effects, and how easy it is for the rest of the team to notice.",
      ),
      h3("Scenario three: the status report"),
      p(
        "Produce the update you currently write by hand. If you cannot generate it from the tool on your trial tier, find out which tier unlocks it and what that costs.",
      ),
      h2("Questions for each vendor"),
      ul(
        "Which of the features we trialled are only on higher plans?",
        "How do paid guests, clients and read-only viewers count towards the plan?",
        "What can we export, and in which formats, if we leave?",
        "What limits apply to automations, storage and integrations on the plan we would buy?",
      ),
      p(
        "Write the answers down next to the trial notes. Vendors change plans often, so a dated written answer is more useful later than a memory of a call.",
      ),
      h2("Before you commit"),
      p(
        "Check how guests, clients and contractors are licensed, how data can be exported and which integrations you depend on, such as chat, calendar and file storage. The cheapest plan that supports your must-have features is usually the one to start with. You can upgrade later when you have evidence you need to.",
      ),
      p(
        "Other products belong in a thorough search. Use the project management category page on Faresolution to see more options, and compare any two or three side by side.",
      ),
    ],
  },
];
