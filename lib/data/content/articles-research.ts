import type { Article } from "../types";
import { callout, h2, h3, p, ul } from "./article-blocks";

export const researchArticles: Article[] = [
  {
    kind: "research",
    slug: "a-framework-for-scoring-software-vendors",
    title: "A framework for scoring software vendors without fooling yourself",
    excerpt:
      "A weighted scorecard is only as honest as the way it is built. A method for choosing criteria, setting weights before you see products, scoring against evidence and testing the result.",
    authorSlug: "elena-marchetti",
    categoryLabel: "Methodology",
    publishedAt: "2025-11-11",
    updatedAt: "2026-06-02",
    relatedProductSlugs: ["hubspot-crm", "zoho-crm", "asana", "zendesk"],
    relatedCategorySlugs: ["crm-software", "project-management", "customer-support"],
    featured: true,
    body: [
      p(
        "Scorecards are the standard tool for comparing software vendors, and they are easy to misuse. A team with a strong preference can build a scorecard that produces the answer it already wanted, and the resulting numbers look objective. This piece sets out a framework designed to keep a scorecard honest. It is a method, not a data report: there are no scores for any product here.",
      ),
      h2("Principle: decide how you will judge before you see products"),
      p(
        "The most common failure is choosing criteria and weights after looking at the vendors. Once you have seen a favourite's strengths, those strengths become \"important\". Fix the criteria and weights first, record them, and only then begin evaluating.",
      ),
      p(
        "If you must revise the weights later, write down why, and re-score every vendor under the new weights. Changing the rules for one contender alone defeats the purpose.",
      ),
      h2("Step 1: separate requirements into three tiers"),
      ul(
        "Must-have: the work cannot proceed without it. A vendor that fails any must-have is out, regardless of its other scores.",
        "Important: materially affects effort or cost, and is scored.",
        "Nice-to-have: a tiebreaker only, with a small weight or none.",
      ),
      p(
        "Treating must-haves as pass or fail rather than as points prevents a strong total from hiding a fatal gap. A tool that scores well everywhere except data export may still be unacceptable.",
      ),
      h2("Step 2: choose a small number of criteria"),
      p(
        "Between six and ten scored criteria is usually enough. More than that and the weights become arbitrary and the scorecard becomes a way to avoid deciding. Group related items so that each criterion represents a real concern.",
      ),
      h3("A reasonable set of criteria groups"),
      ul(
        "Fit to scenarios: how well it handles your real workflows.",
        "Ease of use: how quickly typical users become productive.",
        "Integration: connection to the systems you already depend on.",
        "Security and administration: access control, auditability, data handling.",
        "Total cost of ownership: licences, add-ons, implementation, training and admin time.",
        "Vendor viability and support: responsiveness, documentation, roadmap transparency.",
        "Exit: data export and contract flexibility.",
      ),
      h2("Step 3: set weights that sum to a fixed total"),
      p(
        "Give the criteria weights that add up to a round number such as one hundred. The constraint forces trade-offs: raising one weight means lowering another. Ask several stakeholders to set weights independently, then compare. Large disagreements show you where the real debate is, and it is better to have it now than after a contract is signed.",
      ),
      callout(
        "Avoid false precision",
        "A weight of 7.3 against 7.1 means nothing. Use coarse steps (for example, 5, 10, 15, 20) and a simple scoring scale such as 0 to 3, so the numbers do not suggest more certainty than the evidence supports.",
      ),
      h2("Step 4: score against evidence, not impressions"),
      p(
        "For each criterion, define what each score means before scoring. For example, for integration: 0 means no connector and no API, 1 means API only, 2 means a connector with limited actions, 3 means a connector that handles your required actions. Then record the evidence that supports each score: a trial result, a documented feature, a vendor's written answer.",
      ),
      p(
        "A score with no evidence is a guess and should be labelled as one. Where the team cannot obtain evidence, mark it \"unknown\" and treat the unknown as a risk to resolve rather than as a neutral value.",
      ),
      h3("Have more than one person score"),
      p(
        "Ask at least two evaluators to score independently, then discuss the differences. This is cheap and reveals both bias and misunderstanding. If two people watching the same trial disagree on a score, the criterion definition is probably unclear.",
      ),
      h2("Step 5: stress-test the result"),
      ul(
        "Sensitivity: change the most important weight by one step. Does the winner change? If so, the decision is close and needs more evidence.",
        "Sanity check: does the top-scoring option feel right to the people who will use it? A mismatch means a criterion is missing.",
        "Cost view: put total cost beside the score rather than folding it in, so you can see what each extra point costs.",
        "Gap review: list the lowest scores for the leading option and decide how each will be managed.",
      ),
      h2("Step 6: record the decision"),
      p(
        "Keep the scorecard, the evidence and the reasoning in one document. When renewal time arrives, or a colleague asks why you chose a tool, you will have an answer, and you will be able to re-run the evaluation with the same criteria against the market as it stands then.",
      ),
      p(
        "A scorecard does not make the decision for you. Its value lies in forcing assumptions into the open and in making the process explainable to people who were not in the room.",
      ),
    ],
  },
  {
    kind: "research",
    slug: "how-faresolution-handles-product-facts-and-reviews",
    title: "How Faresolution approaches product facts, verification and reviews",
    excerpt:
      "What this demonstration site records about each product, what it deliberately leaves blank, and the principles it intends to follow as verified vendor data and reviews are introduced.",
    authorSlug: "elena-marchetti",
    categoryLabel: "Methodology",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-16",
    relatedProductSlugs: ["hubspot-crm", "zoho-crm", "notion"],
    relatedCategorySlugs: ["crm-software", "collaboration-software"],
    featured: false,
    body: [
      p(
        "A comparison site is only as useful as the trust you can place in its facts. This piece describes how Faresolution currently treats product information and the principles it intends to follow as the site matures. It is a statement of method rather than a report of findings.",
      ),
      h2("What this build contains"),
      p(
        "The product profiles on this site are sample data written for a demonstration. Descriptions, categories, feature tags and plan summaries are drawn from general, publicly known information about each product. They have not been checked against current vendor documentation and they have not been confirmed by the vendors.",
      ),
      p(
        "Every product is therefore flagged as unverified, and the site shows a notice to that effect. If you rely on a detail, such as a free plan or an integration, confirm it with the vendor first.",
      ),
      h2("What is left blank on purpose"),
      p(
        "Some fields are easy to invent and hard to keep correct. Where the site cannot state a fact confidently, it shows nothing rather than a plausible-looking guess.",
      ),
      ul(
        "Ratings and review counts are empty for every product, because no reviews have been collected.",
        "Prices are not listed, because plan prices change often and vary by region, billing period and negotiation. Plans are described in words only.",
        "Trial lengths and exact plan limits are omitted for the same reason.",
        "Fields where we are unsure are recorded as unknown and displayed as \"Not verified\", never as zero or as an empty rating.",
      ),
      callout(
        "Blank is not negative",
        "A missing value means the site has not verified it. It does not mean the product lacks the feature, the plan or the integration.",
      ),
      h2("Principles for verified data"),
      h3("Source every fact"),
      p(
        "When verified data is introduced, each material fact should be traceable to a source, such as the vendor's documentation or a vendor-supplied profile, along with the date it was last checked. A fact without a source stays marked as unverified.",
      ),
      h3("Separate vendor claims from independent observation"),
      p(
        "A vendor describing its own product is a legitimate source, but it should be labelled as such. Claims about performance, security or outcomes need independent support before being presented as fact.",
      ),
      h3("Show when something was last checked"),
      p(
        "Software changes. A feature list that was right last year may be wrong today. Pages should show a last-checked date so that readers can judge how much to rely on them.",
      ),
      h2("Principles for reviews"),
      p(
        "Reviews are valuable only if readers can trust that they are real. Before any rating appears on this site, the following principles are intended to apply:",
      ),
      ul(
        "A rating is shown only when it is backed by actual submitted reviews, with the number of reviews displayed beside it.",
        "Reviewers describe their role, company size and how long they used the product, without exposing personal data.",
        "Vendors can respond to reviews but cannot remove or edit them.",
        "Editorial content, including shortlists, is separated from any commercial relationship, and any such relationship is disclosed.",
        "Reviews that appear incentivised, duplicated or fabricated are excluded.",
      ),
      h2("Corrections and updates"),
      p(
        "Errors will happen. When a reader or a vendor points out a factual mistake, the page should be corrected promptly and, where the change is material, carry a note saying what changed and when. Silent edits make it harder for readers to know which version they relied on.",
      ),
      h2("Editorial lists and rankings"),
      p(
        "Shortlists on this site are editor's selections made against stated criteria. They do not use numeric rankings, because without review data or hands-on testing a ranking would imply an evidence base that does not exist. Where a list is based on publicly documented positioning rather than testing, it says so.",
      ),
      p(
        "The \"trending\" order shown on some pages is likewise an editorial ordering. It is not derived from traffic, searches or reviews, and is labelled \"Editor-curated\" wherever it appears.",
      ),
      h2("How to read the site today"),
      ul(
        "Use product pages to learn what a product is for and which questions to ask.",
        "Use category pages and buying guides to learn what to check before you shortlist.",
        "Use comparisons to line up structural facts side by side, then verify the ones that matter.",
        "Use vendors' own sites for current pricing, limits and security documentation.",
      ),
      p(
        "The forms on this demonstration site store entries only in your own browser. Nothing is sent to us, and no email is delivered. As the site moves beyond a demonstration, these principles are the standard it should be held to.",
      ),
    ],
  },
];
