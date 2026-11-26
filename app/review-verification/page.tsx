import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/reviews/PolicyPage";
import { ReviewsHeader, ReviewsStatus } from "@/components/reviews/ReviewsHeader";
import { Container } from "@/components/ui/Container";
import { buildMetadata } from "@/lib/seo";

const title = "How reviewers will be verified";
const description =
  "The verification plan for reviews on Faresolution: how reviewers will show they use a product, what happens to the evidence, and how verification will affect ratings. Not in operation yet.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/review-verification" });

const SECTIONS: PolicySection[] = [
  {
    id: "status",
    heading: "Where this stands",
    paragraphs: [
      "This is the verification process planned for when review collection opens. No reviewer has been verified and no review has been published, so no review or listing on Faresolution carries a verified mark today. Nothing here describes a check that is already running.",
    ],
  },
  {
    id: "why",
    heading: "Why reviewers will be verified",
    paragraphs: [
      "A rating is only as good as the people behind it. Verification will let us confirm, with reasonable effort, that a reviewer is a real person who has used the product, so that a handful of fabricated or purchased reviews cannot move a score.",
      "It will not be a judgement of whether a review is positive or negative, and it will never be a condition of publishing a fair negative review.",
    ],
  },
  {
    id: "options",
    heading: "How a reviewer will show they use a product",
    paragraphs: ["Reviewers will choose one of these, whichever is easiest for them. Each will be explained before anything is asked for."],
    items: [
      {
        title: "Work email address",
        body: "The reviewer will confirm they control an email address at a company that uses the product. We will send a one-time link to that address and check it matches the company they name.",
      },
      {
        title: "Professional profile",
        body: "The reviewer will link a public professional profile, such as LinkedIn, that shows a role at a company using the product, so we can check the job title and employer given in the review.",
      },
      {
        title: "Screenshot of the account",
        body: "The reviewer will upload a screenshot that shows they have an account, such as a settings or billing page. Personal and customer data must be covered before upload, and the screenshot will be deleted once checked.",
      },
    ],
  },
  {
    id: "checks",
    heading: "What will be checked",
    items: [
      { body: "That the evidence matches the product being reviewed and the role and company size given in the review." },
      { body: "That the reviewer is not an employee of the vendor or of a direct competitor, in line with the conflict-of-interest rules in the review guidelines." },
      { body: "That the same person is not submitting several reviews of one product, or the same text for several products." },
      { body: "That the review has no signs of being generated in bulk, copied or incentivised without disclosure." },
    ],
  },
  {
    id: "outcome",
    heading: "What verification will change",
    paragraphs: [
      "Only verified reviews will be published and counted toward a product's rating. A published review will say how it was verified (for example, work email) without naming the reviewer or their company unless the reviewer chooses to.",
      "If a reviewer cannot be verified, the review will not be published and the reviewer will be told why. A reviewer will be able to try another method.",
    ],
  },
  {
    id: "data",
    heading: "How verification data will be handled",
    items: [
      { title: "Used for one purpose", body: "Evidence will be used only to verify the review it was given for." },
      { title: "Kept briefly", body: "Screenshots will be deleted once checked. Email addresses and profile links will be kept only as long as needed to resolve disputes or prevent repeat abuse." },
      { title: "Never shown", body: "Verification evidence will not be published, shared with the vendor, or sold." },
      { title: "Yours to withdraw", body: "A reviewer will be able to ask for their evidence and review to be deleted." },
    ],
  },
  {
    id: "limits",
    heading: "What verification will not do",
    paragraphs: [
      "No process can prove every claim in a review. Verification will show that the reviewer has a real connection to the product; it will not show that every statement is accurate. Moderation under the review guidelines, and reports from readers and vendors, will be the other safeguards.",
    ],
  },
  {
    id: "today",
    heading: "What you can do today",
    paragraphs: [
      "You can write a draft review of any listed product. The draft is saved only in your browser, and it will not be verified, published or sent anywhere. When collection opens you will need to submit it again, with verification.",
    ],
  },
];

export default function ReviewVerificationPage() {
  return (
    <>
      <ReviewsHeader
        current="/review-verification"
        crumbs={[{ label: "Home", href: "/" }, { label: "Reviews", href: "/reviews" }, { label: "Verification plan" }]}
        title="How reviewers will be verified"
        intro={
          <p>
            The plan for confirming that reviewers use the products they review, written as the policy that will apply
            when review collection opens. It is not in operation yet.
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
