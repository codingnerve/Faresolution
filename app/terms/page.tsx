import { Ban, ExternalLink, Info, Scale, Search, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalDraftNotice, Placeholder } from "@/components/company/CompanyHeader";
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

const title = "Terms of Use";
const description =
  "The terms for using Faresolution: what the directory is, how its listings, prices and comparisons may be used, acceptable use, vendors, liability and how to contact us.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/terms" });

const EFFECTIVE = "26 November 2026";
const UPDATED = "27 November 2026";

const link = "font-medium text-blue-ink underline decoration-blue/30 underline-offset-2 hover:decoration-blue";

const GLANCE: LegalGlanceItem[] = [
  {
    icon: Search,
    title: "Free to use, no account",
    body: "You can search, compare and shortlist software without signing up or paying.",
  },
  {
    icon: Info,
    title: "Information, not advice",
    body: "Listings and comparisons help your research. Confirm what matters with the vendor before you buy.",
  },
  {
    icon: Tag,
    title: "Prices are vendors' list prices",
    body: "Copied from each vendor's pricing page with the date checked. They can change at any time.",
  },
  {
    icon: Scale,
    title: "Rankings are never paid",
    body: "Recommendations and alternatives come from catalogue similarity, not from payment.",
  },
  {
    icon: Ban,
    title: "Use it fairly",
    body: "No attacks on the site, bulk copying or pretending to represent a vendor.",
  },
  {
    icon: ExternalLink,
    title: "Vendor sites are theirs",
    body: "When you follow a link to a vendor, their terms and privacy policy apply.",
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    body: (
      <>
        <LegalP>
          These terms cover your use of faresolution.org (&ldquo;Faresolution&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;),
          a directory that helps people find, compare and shortlist business software. By using the site you agree to
          them. If you don&rsquo;t agree, please don&rsquo;t use the site.
        </LegalP>
        <LegalP>
          The site is operated by <Placeholder>operator legal name and address</Placeholder>. How we handle information is
          explained in our{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>
          .
        </LegalP>
        <LegalCallout>
          <strong className="font-semibold text-navy">Effective date</strong> &mdash; {EFFECTIVE}
          <br />
          <strong className="font-semibold text-navy">Last updated</strong> &mdash; {UPDATED}
        </LegalCallout>
      </>
    ),
  },
  {
    id: "service",
    heading: "What Faresolution is",
    body: (
      <>
        <LegalP>
          Faresolution lists business software with descriptions, features, plans, published prices, comparisons and
          similar products. The site is currently a preview before launch:
        </LegalP>
        <LegalList
          items={[
            { body: "Listings are written from public product information and have not been verified with their vendors." },
            { body: "No reviews have been collected yet, so no product has a rating." },
            { body: "There are no accounts and nothing can be bought on the site." },
            { body: "The vendor programme, review collection and newsletter open at launch, under terms published then." },
          ]}
        />
      </>
    ),
  },
  {
    id: "information",
    heading: "Using the information",
    body: (
      <LegalList
        items={[
          {
            title: "General information, not advice",
            body: "Listings, comparisons, shortlists and guides are general information to help you research. They are not professional, legal or financial advice, and not a recommendation to buy.",
          },
          {
            title: "Check before you rely on it",
            body: "Facts may be incomplete or out of date, and some are marked “Not verified”. Confirm anything that matters to your decision, such as prices, plans, security or integrations, with the vendor before you buy.",
          },
          {
            title: "Personal and internal use",
            body: "You may read, print and share pages for your own research and within your organisation, with a link back to the page.",
          },
        ]}
      />
    ),
  },
  {
    id: "pricing",
    heading: "Prices and comparisons",
    body: (
      <>
        <LegalList
          items={[
            {
              title: "Published list prices",
              body: "Prices are copied from each vendor's own pricing page and shown with the date they were checked and a link to the source. Unless stated otherwise they are in US dollars and exclude taxes, discounts and promotions.",
            },
            {
              title: "Prices change",
              body: "Vendors can change prices, plans and billing terms at any time, and prices can differ by country, currency, billing period and number of users. The vendor's price at the time you buy is the one that applies.",
            },
            {
              title: "Price on request",
              body: "Where a vendor does not publish a price, the plan says so. We never estimate a price.",
            },
            {
              title: "Comparisons and recommendations",
              body: "Similar products, comparisons and recommendations are chosen from catalogue facts such as category, features and pricing model. No vendor can pay to change them.",
            },
          ]}
        />
        <LegalP>We do not sell software and are not a party to any purchase you make from a vendor.</LegalP>
      </>
    ),
  },
  {
    id: "names",
    heading: "Product names, logos and trademarks",
    body: (
      <LegalP>
        Product and company names and logos are trademarks of their owners and are shown only to identify the products.
        A listing does not mean that a vendor endorses Faresolution, has a relationship with it or has approved its
        listing. If you own a mark shown on the site and want it corrected or removed, contact us.
      </LegalP>
    ),
  },
  {
    id: "forms",
    heading: "What you enter in forms",
    body: (
      <LegalP>
        The site&rsquo;s forms keep what you enter only in your browser; nothing is sent to us or to a vendor, and
        nothing is published. Please don&rsquo;t enter confidential information or other people&rsquo;s personal
        information.
      </LegalP>
    ),
  },
  {
    id: "reviews",
    heading: "Reviews",
    body: (
      <LegalP>
        Review collection has not opened. When it does, reviews will need to follow the{" "}
        <Link href="/review-guidelines" className={link}>
          review guidelines
        </Link>{" "}
        and pass{" "}
        <Link href="/review-verification" className={link}>
          verification
        </Link>
        , and the terms for submitting and publishing a review will be set out before then.
      </LegalP>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: (
      <>
        <LegalP>Please don&rsquo;t use the site in a way that harms it or other people. In particular, don&rsquo;t:</LegalP>
        <LegalList
          items={[
            { body: "Try to break into, overload or disrupt the site, or get around its security." },
            { body: "Copy the directory in bulk, or collect its content with automated tools beyond what normal search engine indexing does." },
            { body: "Use the site to break the law, infringe someone's rights or mislead people, for example by pretending to represent a vendor you don't represent." },
          ]}
        />
      </>
    ),
  },
  {
    id: "vendors",
    heading: "Vendors",
    body: (
      <LegalP>
        Nothing on the vendor pages is an offer or a contract. Vendor plans are described as planned, their pricing has
        not been set, and claim requests and interest entries are not yet received or acted on. Terms for vendors will
        be published when the programme opens. Vendors can ask for a factual correction to their listing at any time
        by emailing{" "}
        <a href={OWNER_CONTACT.emailHref} className={link}>
          {OWNER_CONTACT.email}
        </a>
        .
      </LegalP>
    ),
  },
  {
    id: "ownership",
    heading: "Our content",
    body: (
      <LegalP>
        The site&rsquo;s text, design, data compilation and code, other than names, logos and material belonging to
        others, are owned by the people behind Faresolution. Apart from the uses allowed in these terms, please ask
        before reusing them.
      </LegalP>
    ),
  },
  {
    id: "liability",
    heading: "Availability and liability",
    body: (
      <>
        <LegalP>
          The site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. It may change, be unavailable or be
          taken down without notice, and we don&rsquo;t promise that its content is complete, accurate or current.
        </LegalP>
        <LegalP>
          To the extent the law allows, we are not responsible for decisions made on the basis of the site&rsquo;s
          content, for loss caused by relying on it, or for a vendor&rsquo;s products, prices or conduct. Nothing in these
          terms limits any right you have that the law does not allow to be limited.
        </LegalP>
      </>
    ),
  },
  {
    id: "links",
    heading: "Links to other sites",
    body: (
      <LegalP>
        The site links to vendors&rsquo; websites and other sources. We don&rsquo;t control those sites and are not
        responsible for their content, prices or practices. Their own terms and privacy policies apply.
      </LegalP>
    ),
  },
  {
    id: "law",
    heading: "Governing law and disputes",
    body: (
      <LegalP>
        These terms are governed by <Placeholder>governing law and jurisdiction</Placeholder>. If you have a concern,
        please contact us first so we can try to resolve it informally.
      </LegalP>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these terms",
    body: (
      <LegalP>
        We may update these terms, and will do so before launch. The &ldquo;Last updated&rdquo; date at the top will
        change with them, and material changes will be announced on the site. Continuing to use the site after a change
        means you accept the updated terms.
      </LegalP>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    body: (
      <LegalP>
        Questions about these terms can be sent to{" "}
        <a href={OWNER_CONTACT.emailHref} className={link}>
          {OWNER_CONTACT.email}
        </a>
        , by phone on{" "}
        <a href={OWNER_CONTACT.phoneHref} className={link}>
          {OWNER_CONTACT.phone}
        </a>
        . The site&rsquo;s contact form is not connected to email yet, so please write directly for now.
      </LegalP>
    ),
  },
];

const FAQ: FaqItem[] = [
  {
    q: "Is Faresolution free to use?",
    a: "Yes. Searching, comparing and shortlisting software is free, and there is no account to create.",
  },
  {
    q: "Are the prices on Faresolution accurate?",
    a: "They are copied from each vendor's own pricing page and shown with the date they were checked. Vendors can change prices at any time, so confirm the current price with the vendor before you buy.",
  },
  {
    q: "Can vendors pay to rank higher?",
    a: "No. Similar products, comparisons and recommendations come from catalogue facts such as category, features and pricing model. Payment never changes them.",
  },
  {
    q: "Can I buy software through Faresolution?",
    a: "No. Faresolution doesn't sell software and isn't part of any purchase. You buy directly from the vendor, on the vendor's terms.",
  },
  {
    q: "Can I share or quote pages from the site?",
    a: "Yes, for your own research and within your organisation, with a link back to the page. Please ask before republishing content or copying the directory in bulk.",
  },
  {
    q: "I'm a vendor and my listing is wrong. What can I do?",
    a: `Email ${OWNER_CONTACT.email} with the correction and a source, and we'll review it. Listing claims and the vendor programme open at launch.`,
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title={title}
      intro={
        <p>
          The rules for using Faresolution: what the directory offers, how you can use its listings, prices and
          comparisons, and what it doesn&rsquo;t offer yet.
        </p>
      }
      startId="service"
      readLabel="Read the terms"
      chips={["Fair use", "Prices", "Trademarks", "Liability"]}
      effectiveDate={EFFECTIVE}
      updatedDate={UPDATED}
      notice={<LegalDraftNotice />}
      glance={GLANCE}
      sections={SECTIONS}
      faq={FAQ}
      related={[
        { title: "Privacy Policy", body: "What your browser stores, what reaches our server and your rights.", href: "/privacy" },
        { title: "Review guidelines", body: "How reviews are collected, checked and published.", href: "/review-guidelines" },
        { title: "Questions?", body: "Contact us about these terms or anything else.", href: "/contact" },
      ]}
      contactEmail={{ label: OWNER_CONTACT.email, href: OWNER_CONTACT.emailHref }}
      closing={{
        title: "Questions about these terms?",
        body: "Write to us about these terms, a correction to a listing or anything else.",
      }}
    />
  );
}
