import { CalendarClock, CircleSlash, CreditCard, Mail, RotateCcw, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalDraftNotice } from "@/components/company/CompanyHeader";
import {
  LegalCallout,
  LegalDocument,
  LegalList,
  LegalP,
  type LegalGlanceItem,
  type LegalSection,
} from "@/components/company/LegalDocument";
import type { FaqItem } from "@/lib/data/types";
import { buildMetadata } from "@/lib/seo";
import { OWNER_CONTACT } from "@/lib/site";

const title = "Refund Policy";
const description =
  "Faresolution's refund policy: refunds for software bought from vendors are handled by each vendor, and Faresolution's own paid plans have a 14-day full refund and can be cancelled anytime.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/refund-policy" });

const EFFECTIVE = "27 November 2026";
const UPDATED = "27 November 2026";
const REFUND_DAYS = 14;

const link = "font-medium text-blue-ink underline decoration-blue/30 underline-offset-2 hover:decoration-blue";
const email = (
  <a href={OWNER_CONTACT.emailHref} className={link}>
    {OWNER_CONTACT.email}
  </a>
);

const GLANCE: LegalGlanceItem[] = [
  {
    icon: Store,
    title: "We don't sell software",
    body: "Faresolution never takes payment for vendors' products, so it can't refund them.",
  },
  {
    icon: CircleSlash,
    title: "Vendor purchases: ask the vendor",
    body: "Software you buy from a vendor is refunded by that vendor, under its own refund policy.",
  },
  {
    icon: RotateCcw,
    title: `${REFUND_DAYS}-day full refund on our plans`,
    body: `Ask within ${REFUND_DAYS} days of your first payment for a Faresolution plan, for any reason.`,
  },
  {
    icon: CalendarClock,
    title: "Cancel anytime",
    body: "Cancel a plan whenever you like. It stays active until the end of the period you paid for.",
  },
  {
    icon: CreditCard,
    title: "Back to your original payment",
    body: "Approved refunds go to the card or account you paid with, in the currency you were charged.",
  },
  {
    icon: Mail,
    title: "One address for requests",
    body: `Email ${OWNER_CONTACT.email} with your payment details to ask for a refund.`,
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    body: (
      <>
        <LegalP>This policy explains refunds for two different kinds of purchase:</LegalP>
        <LegalList
          items={[
            {
              title: "Software you buy from a vendor",
              body: "after finding it on Faresolution. You buy it from the vendor, and the vendor's refund policy applies (section 02).",
            },
            {
              title: "Faresolution's own paid plans",
              body: `such as vendor plans, which you buy from us. These have a ${REFUND_DAYS}-day full refund (sections 03 to 08).`,
            },
          ]}
        />
        <LegalCallout>
          <strong className="font-semibold text-navy">Status:</strong> Faresolution&rsquo;s paid plans open when the
          vendor programme launches. Until then nothing can be bought from Faresolution, so section 02 is the part that
          applies today.
          <br />
          <strong className="font-semibold text-navy">Effective date</strong> &mdash; {EFFECTIVE} &middot;{" "}
          <strong className="font-semibold text-navy">Last updated</strong> &mdash; {UPDATED}
        </LegalCallout>
        <LegalP>
          This policy forms part of our{" "}
          <Link href="/terms" className={link}>
            Terms of Use
          </Link>
          .
        </LegalP>
      </>
    ),
  },
  {
    id: "vendor-purchases",
    heading: "Software bought from vendors",
    body: (
      <>
        <LegalP>
          Faresolution is a directory. We don&rsquo;t sell software, take payment for it or act as the seller, so we
          can&rsquo;t issue, approve or block a refund for a product you bought from a vendor.
        </LegalP>
        <LegalList
          items={[
            { title: "The vendor's policy applies", body: "refund windows, free trials, cancellation and money-back guarantees are set by each vendor and differ between products and plans." },
            { title: "Check before you buy", body: "read the vendor's refund and cancellation terms on its own website before you pay, especially for annual plans, which are often non-refundable." },
            { title: "Ask the vendor first", body: "contact the vendor's billing or support team with your order details. Your card provider may also be able to help if a vendor does not respond." },
            { title: "Tell us about wrong listings", body: `if a listing's prices or free-trial details were wrong, email ${OWNER_CONTACT.email} so we can correct it. We can't refund the purchase, but we will fix the listing.` },
          ]}
        />
      </>
    ),
  },
  {
    id: "eligibility",
    heading: `${REFUND_DAYS}-day refund on Faresolution plans`,
    body: (
      <>
        <LegalP>
          If you buy a Faresolution paid plan, you can get a{" "}
          <strong className="font-semibold text-navy">full refund of your first payment, for any reason</strong>, if you
          ask within {REFUND_DAYS} days of that payment. You don&rsquo;t need to explain why.
        </LegalP>
        <LegalP>
          The {REFUND_DAYS} days start on the date of the payment and include weekends and holidays. A request we receive
          by email on day {REFUND_DAYS} counts. When a refund is approved, the plan ends and its paid features stop.
        </LegalP>
      </>
    ),
  },
  {
    id: "not-eligible",
    heading: "What isn't refundable",
    body: (
      <>
        <LegalP>Outside the {REFUND_DAYS}-day window, payments are not refunded. In particular:</LegalP>
        <LegalList
          items={[
            { title: "Late requests", body: `requests made more than ${REFUND_DAYS} days after the first payment.` },
            { title: "Renewals", body: "automatic monthly or annual renewal payments. Cancel before the renewal date to avoid the next charge (section 05)." },
            { title: "Unused time", body: "the remaining part of a period you paid for, including if you stop using the plan or cancel partway through." },
            { title: "Plans not used", body: "a plan is not refunded after the window just because its features were never used, so try it early." },
          ]}
        />
        <LegalP>
          If a payment was taken in error, for example a duplicate charge or a charge after you cancelled, we will refund
          it whenever you tell us.
        </LegalP>
      </>
    ),
  },
  {
    id: "cancel",
    heading: "Cancelling a plan",
    body: (
      <LegalP>
        You can cancel a Faresolution plan at any time. Cancelling stops the next renewal, so you won&rsquo;t be charged
        again, and your plan stays active until the end of the period you have already paid for. To cancel, email {email}{" "}
        from the address on your account.
      </LegalP>
    ),
  },
  {
    id: "how-to",
    heading: "How to request a refund",
    body: (
      <>
        <LegalP>Email {email} with:</LegalP>
        <LegalList
          items={[
            { body: "the email address on your Faresolution account;" },
            { body: "the plan, the payment date and the amount;" },
            { body: "the last four digits of the card, or your payment reference;" },
            { body: "the reason, if you would like to share it (it is optional and won't affect your refund)." },
          ]}
        />
        <LegalP>We will confirm by email whether the refund has been approved.</LegalP>
      </>
    ),
  },
  {
    id: "processing",
    heading: "How refunds are paid",
    body: (
      <LegalP>
        Approved refunds are paid to the original payment method, in the currency you were charged, for the full amount
        of the payment, including any taxes we collected. We don&rsquo;t give refunds as credit unless you ask for it.
        Once we have issued a refund, the time it takes to reach you depends on your bank or card provider.
      </LegalP>
    ),
  },
  {
    id: "abuse",
    heading: "Chargebacks and repeated refunds",
    body: (
      <>
        <LegalP>
          Please contact us before you dispute a Faresolution charge with your bank. Most problems can be fixed faster
          that way, and a refund we issue directly avoids chargeback fees.
        </LegalP>
        <LegalP>
          The {REFUND_DAYS}-day refund is meant for people trying a plan in good faith. If an account repeatedly buys and
          refunds plans, we may decline further refunds for that account or suspend it.
        </LegalP>
      </>
    ),
  },
  {
    id: "rights",
    heading: "Your legal rights",
    body: (
      <LegalP>
        This policy adds to your rights; it doesn&rsquo;t take any away. Nothing in it limits a right you have under the
        Consumer Protection Act, 2019 or any other law that cannot be excluded by agreement, such as a right to a refund
        for a service that was not provided as described.
      </LegalP>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <LegalP>
        We may update this policy, and will do so before paid plans open. The &ldquo;Last updated&rdquo; date at the top
        will change with it. A change never reduces the refund rights that applied when you made a payment.
      </LegalP>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    body: (
      <LegalP>
        For refunds, cancellations or questions about this policy, email {email} or call{" "}
        <a href={OWNER_CONTACT.phoneHref} className={link}>
          {OWNER_CONTACT.phone}
        </a>
        . The site&rsquo;s contact form is not connected to email yet, so please write directly.
      </LegalP>
    ),
  },
];

const FAQ: FaqItem[] = [
  {
    q: "Can Faresolution refund software I bought from a vendor?",
    a: "No. Faresolution doesn't sell software or take payment for it, so the vendor you bought from handles refunds under its own policy. Contact the vendor's billing or support team.",
  },
  {
    q: `How long do I have to ask for a refund on a Faresolution plan?`,
    a: `${REFUND_DAYS} days from your first payment. Within that time you get a full refund for any reason.`,
  },
  {
    q: "Are renewal payments refundable?",
    a: "No, but you can cancel at any time before the renewal date and you won't be charged again. A charge taken in error, such as after you cancelled, is always refunded.",
  },
  {
    q: "If I cancel, do I lose access straight away?",
    a: "No. Your plan stays active until the end of the period you have already paid for, then it doesn't renew.",
  },
  {
    q: "How do I ask for a refund?",
    a: `Email ${OWNER_CONTACT.email} with your account email, the plan, the payment date and amount, and the last four digits of the card or your payment reference.`,
  },
  {
    q: "Where will my refund go?",
    a: "To the original payment method, in the currency you were charged. How long it takes to appear depends on your bank or card provider.",
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      title={title}
      intro={
        <p>
          Refunds for software you buy from vendors, and the {REFUND_DAYS}-day refund and cancel-anytime terms for
          Faresolution&rsquo;s own paid plans.
        </p>
      }
      startId="vendor-purchases"
      chips={[`${REFUND_DAYS}-day refunds`, "Cancel anytime", "Vendor purchases", "Fair use"]}
      effectiveDate={EFFECTIVE}
      updatedDate={UPDATED}
      notice={<LegalDraftNotice />}
      glance={GLANCE}
      sections={SECTIONS}
      faq={FAQ}
      related={[
        { title: "Terms of Use", body: "The rules for using Faresolution, including prices and comparisons.", href: "/terms" },
        { title: "Vendor plans", body: "What the planned vendor plans will include.", href: "/vendors/pricing" },
        { title: "Privacy Policy", body: "What your browser stores, what reaches our server and your rights.", href: "/privacy" },
      ]}
      contactEmail={{ label: OWNER_CONTACT.email, href: OWNER_CONTACT.emailHref }}
      closing={{
        title: "Need a refund or have a question?",
        body: "Write to us with your payment details and we'll take it from there.",
      }}
    />
  );
}
