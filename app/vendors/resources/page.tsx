import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/reviews/PolicyPage";
import { Container } from "@/components/ui/Container";
import { VendorProgrammeStatus, VendorsHeader } from "@/components/vendors/VendorsHeader";
import { SITE_NAME } from "@/lib/utils";

const title = "Vendor resources";
const description =
  "Practical guidance for software vendors: preparing a listing, what to have ready for a claim, how reviews will be collected and answered, and how advertising will be labelled.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/vendors/resources" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/vendors/resources", title, description },
};

const SECTIONS: PolicySection[] = [
  {
    id: "prepare",
    heading: "Preparing your listing",
    paragraphs: [
      "Buyers use a listing to decide whether a product belongs on their shortlist. They want to know, quickly, what it does, who it suits, how it is deployed and what it is likely to cost. A listing that answers those questions plainly will do more for you than one that sounds impressive.",
      "Start from your own product's current state, not its roadmap. Describe what a customer gets today, and keep launch dates and promises for your own site.",
    ],
    items: [
      { title: "Lead with the job it does", body: "One sentence a buyer would recognise, such as “Help desk software for small support teams”, rather than a slogan." },
      { title: "Say who it is for", body: "The company sizes and industries you actually serve. Leaving out a segment you don't serve well saves everyone time." },
      { title: "Be specific about deployment", body: "Cloud, on-premises or both, and which platforms have native apps. Buyers filter on these facts." },
      { title: "List real integrations", body: "Only integrations a customer can switch on today, whether native or through a connector, and say which." },
    ],
  },
  {
    id: "ready",
    heading: "What to have ready for a claim",
    paragraphs: [
      "Claims open at launch. Having these to hand will make the claim and the first round of corrections quick.",
    ],
    items: [
      { body: "A work email at the product's own domain, and the name of someone who can confirm your role if asked." },
      { body: "Access to your company website or DNS, in case ownership is confirmed by adding a record or a file." },
      { body: "A short description (one sentence) and a longer one (two or three short paragraphs) in plain language." },
      { body: "Your current plans: their names, what each includes, whether there is a free plan or trial, and a public page where the prices are published." },
      { body: "Deployment options, supported platforms, company sizes served and the languages the product is available in." },
      { body: "A list of integrations, with a link to each integration's documentation." },
      { body: "Screenshots of the product as customers see it today, without customer data, at a resolution that stays legible." },
    ],
  },
  {
    id: "pricing",
    heading: "Pricing information",
    paragraphs: [
      "The directory shows a pricing fact only when it can be checked against a public source. Anything else reads “Not verified”, which buyers will see on many listings today. Publishing your prices on your own site, and linking to that page, is the surest way to have them shown.",
      "Please don't send prices that apply only to some customers or regions without saying so. Starting prices are useful only if a buyer could actually pay them.",
    ],
  },
  {
    id: "reviews",
    heading: "How reviews will be collected",
    paragraphs: [
      "Review collection isn't open yet, and no product has reviews today. When it opens, reviews will come from people who have used the product, and each will be checked against the review guidelines before it is published. Ratings will be calculated only from published reviews.",
      "Vendors will be able to invite their customers to review the product. Invited reviews will be labelled as invited, and will go through the same checks as any other. Offering customers a reward for a review will need to be disclosed in the review, and a reward that depends on a positive review will not be allowed.",
    ],
  },
  {
    id: "responding",
    heading: "Responding to reviews",
    paragraphs: [
      "Once your claim is confirmed you will be able to post one public response to each review of your product. Good responses are short, specific and calm: thank the reviewer, address the point they raised, and say what has changed if something has.",
    ],
    items: [
      { body: "Don't ask the reviewer to change or remove the review, and don't offer anything in return for doing so." },
      { body: "Don't share details about the reviewer's account, contract or support history in public." },
      { body: "Don't use a response to advertise, or to link to a discount or a sales page." },
      { body: "If you believe a review breaks the guidelines, report it instead of arguing it in a response." },
    ],
  },
  {
    id: "advertising",
    heading: "Advertising labelling policy",
    paragraphs: [
      "Sponsored placements will be sold at launch, and only in clearly separate slots. The rules below will apply to every one of them.",
    ],
    items: [
      { title: "Always labelled", body: "Every paid placement will carry a visible “Sponsored” label, next to the product name, at every screen size." },
      { title: "Kept apart from organic results", body: "Sponsored slots will sit above or beside results, never mixed into them, and organic order will follow only the buyer's filters and sort." },
      { title: "No effect on reviews or ratings", body: "Buying a placement will not change a product's reviews, rating or review checks." },
      { title: "Not in editorial content", body: "Shortlists, buying guides and research will be written by the editors. Sponsorship will never place a product in them." },
    ],
  },
  {
    id: "corrections",
    heading: "Corrections before launch",
    paragraphs: [
      "If a fact on your listing is wrong today, you can tell us through the contact form, choosing “A correction to a listing”. In this demo the message is stored only in your browser and not sent, so treat the form as a way to draft your corrections; at launch, the same information will go into your claim.",
    ],
  },
];

export default function VendorResourcesPage() {
  return (
    <>
      <VendorsHeader
        current="/vendors/resources"
        title="Vendor resources"
        intro={
          <p>
            Practical guidance for getting a listing right, and the rules that will apply to reviews and advertising when
            the vendor programme opens at launch.
          </p>
        }
      />
      <Container className="pt-10 sm:pt-14">
        <VendorProgrammeStatus />
      </Container>
      <PolicyPage sections={SECTIONS} />
    </>
  );
}
