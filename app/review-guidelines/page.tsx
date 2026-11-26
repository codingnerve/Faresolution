import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/reviews/PolicyPage";
import { ReviewsHeader, ReviewsStatus } from "@/components/reviews/ReviewsHeader";
import { Container } from "@/components/ui/Container";
import { buildMetadata } from "@/lib/seo";

const title = "Review guidelines";
const description =
  "The guidelines that will apply to reviews on Faresolution when review collection opens: what is welcome, what will be rejected, conflicts of interest, vendor responses, reporting and edit requests.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/review-guidelines" });

const SECTIONS: PolicySection[] = [
  {
    id: "purpose",
    heading: "Why these guidelines exist",
    paragraphs: [
      "A review is useful when a buyer can trust that it describes real use of the product. These guidelines set out what we will expect from reviewers and how we will treat what they submit, so that every published review meets the same standard.",
      "They describe the policy for launch. Review collection has not opened, and no review has been collected, moderated or published under them yet.",
    ],
  },
  {
    id: "welcome",
    heading: "What will be welcome",
    items: [
      { title: "First-hand use", body: "Reviews will need to come from someone who has used the product themselves, for their work or a team they belong to." },
      { title: "Specific detail", body: "What you used it for, what worked, what did not, and how long you used it. Concrete examples help the next buyer far more than general praise or complaint." },
      { title: "Balanced accounts", body: "Both what you liked and what could be better will be required, because almost every product has both." },
      { title: "Your own words", body: "Reviews will need to be written by the reviewer, in the reviewer's own words, about the reviewer's own experience." },
    ],
  },
  {
    id: "rejected",
    heading: "What will be rejected",
    paragraphs: ["Reviews that do any of the following will be declined, or returned to the reviewer for changes where a fix is possible."],
    items: [
      { body: "Describe a product the reviewer has not used, or a different product from the one being reviewed." },
      { body: "Were written, paid for or incentivised by the vendor, a competitor or anyone else with a stake in the rating, unless the incentive is disclosed and we have said in advance that such reviews are accepted." },
      { body: "Contain personal data about other people, such as names of colleagues, private emails or customer information." },
      { body: "Contain abuse, harassment, discrimination, threats or hate speech, or make accusations of crimes or misconduct we cannot reasonably check." },
      { body: "Are mainly advertising, include promotional links or discount codes, or ask readers to contact the reviewer." },
      { body: "Copy text from another review, a vendor page or another site, or were generated in bulk." },
      { body: "Are about the vendor's sales or billing dispute rather than the product, where the product itself is not described." },
    ],
  },
  {
    id: "conflicts",
    heading: "Conflicts of interest",
    paragraphs: [
      "Reviewers will be asked to say whether they work for, are paid by, or hold a financial interest in the vendor, a reseller or a direct competitor. Employees of a vendor will not be able to review that vendor's own product, and we will not publish reviews of a product from people who work for its competitors.",
      "Where someone received a free licence or another benefit in return for a review, the review will have to say so. Reviews that fail to disclose a conflict they were asked about will be removed.",
    ],
  },
  {
    id: "vendors",
    heading: "Vendor responses",
    paragraphs: [
      "Once a vendor has a verified claim on its listing, it will be able to post one public response to each review of its product. A response will be marked as coming from the vendor and will follow the same rules as a review: factual, civil and free of promotion.",
      "Vendors will not be able to edit, hide, rank or remove reviews, and no plan will change how reviews are treated. A vendor that believes a review breaks these guidelines will be able to report it, and the report will be handled like any other (see Reporting).",
    ],
  },
  {
    id: "reporting",
    heading: "Reporting a review",
    paragraphs: [
      "Every published review will have a way to report it. A report will name the guideline the review is thought to break and give a short reason. Reports will be read by a person, who will keep the review, ask the reviewer for changes, or remove it, and the reviewer will be told which.",
      "Reports from vendors and from readers will be treated alike. A review will not be removed only because it is negative.",
    ],
  },
  {
    id: "edits",
    heading: "Edit and removal requests",
    paragraphs: [
      "Reviewers will be able to ask us to edit or remove their own review, for example to add detail after more time with the product or to correct a mistake. An edited review will go back through the same checks before the change is shown.",
      "Reviews that change materially will say they have been updated and when. Reviews will not be edited by us on a vendor's request.",
    ],
  },
  {
    id: "ratings",
    heading: "How ratings will be calculated",
    paragraphs: [
      "A product's rating will be calculated only from published reviews that have passed verification (see the verification plan). Each of the five criteria (overall, ease of use, value for money, features and customer support) will be shown separately. Until a product has published reviews, its page will say it has none and will show no score.",
    ],
  },
  {
    id: "drafts",
    heading: "Drafts and your data",
    paragraphs: [
      "Today you can write a draft review. It is saved only in your browser, on your device. Nothing is sent to us or to a vendor, and clearing your browser data removes it.",
      "When collection opens, the details a reviewer gives for verification will be used for that purpose only, kept no longer than needed and not published. A reviewer's name will not be shown on a review unless the reviewer chooses to show it.",
    ],
  },
];

export default function ReviewGuidelinesPage() {
  return (
    <>
      <ReviewsHeader
        current="/review-guidelines"
        crumbs={[{ label: "Home", href: "/" }, { label: "Reviews", href: "/reviews" }, { label: "Review guidelines" }]}
        title="Review guidelines"
        intro={
          <p>
            The rules that will apply to every review once review collection opens: what we will welcome, what we will
            reject, and how conflicts, vendor responses, reports and edits will be handled.
          </p>
        }
      />
      <Container className="pt-10 sm:pt-14">
        <ReviewsStatus />
      </Container>
      <PolicyPage sections={SECTIONS} />
    </>
  );
}
