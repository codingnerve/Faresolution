import { Ban, Cookie, HardDrive, Mail, Scale, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LegalDraftNotice, Placeholder } from "@/components/company/CompanyHeader";
import {
  LegalCallout,
  LegalDocument,
  LegalList,
  LegalP,
  LegalSubhead,
  LegalTable,
  type LegalGlanceItem,
  type LegalSection,
} from "@/components/company/LegalDocument";
import type { FaqItem } from "@/lib/data/types";
import { buildMetadata } from "@/lib/seo";
import { OWNER_CONTACT } from "@/lib/site";

const title = "Privacy Policy";
const description =
  "How Faresolution handles information: what your browser stores, what reaches our server, your rights under India's DPDP Act, cookies, retention and how to contact us.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/privacy" });

const EFFECTIVE = "26 November 2026";
const UPDATED = "27 November 2026";

const link = "font-medium text-blue-ink underline decoration-blue/30 underline-offset-2 hover:decoration-blue";
const email = (
  <a href={OWNER_CONTACT.emailHref} className={link}>
    {OWNER_CONTACT.email}
  </a>
);

const GLANCE: LegalGlanceItem[] = [
  {
    icon: Ban,
    title: "We don't sell personal information",
    body: "Not to vendors, advertisers or anyone else. Paying vendors never get visitor data.",
  },
  {
    icon: HardDrive,
    title: "Your entries stay in your browser",
    body: "Saved products, your compare list and form entries are stored on your device, not sent to us.",
  },
  {
    icon: ShieldCheck,
    title: "No tracking scripts",
    body: "No analytics, advertising pixels or social media trackers. No third-party scripts are loaded.",
  },
  {
    icon: Cookie,
    title: "No cookies from our code",
    body: "The site works without cookies. If that changes, this policy will list each one first.",
  },
  {
    icon: Scale,
    title: "Rights under the DPDP Act",
    body: "Access, correction, erasure, withdrawing consent, nominating someone and raising a grievance.",
  },
  {
    icon: Mail,
    title: "One address for requests",
    body: `Write to ${OWNER_CONTACT.email} about anything in this policy.`,
  },
];

const SECTIONS: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    body: (
      <>
        <LegalP>
          This policy explains how Faresolution handles information when you use faresolution.org, a directory that
          helps people find, compare and shortlist business software. It covers visitors to the site, people who use
          its forms, and software vendors whose products are listed.
        </LegalP>
        <LegalP>
          The site is currently a preview before launch. Accounts, the newsletter, review collection, listing claims
          and buyer requests are not live yet. This policy describes how the site works today, and says what will
          change before any of those features open.
        </LegalP>
        <LegalP>
          The organisation responsible for the site is <Placeholder>operator legal name and address</Placeholder>.
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
    id: "collection",
    heading: "Information we collect",
    body: (
      <>
        <LegalSubhead>Information you provide</LegalSubhead>
        <LegalP>
          The site&rsquo;s forms ask for the following. Today, everything you enter is stored only in your own browser
          and is not sent to us or to any vendor.
        </LegalP>
        <LegalList
          items={[
            { title: "Newsletter", body: "your email address." },
            { title: "Contact form", body: "your name, email address, company, topic and message." },
            { title: "Review drafts", body: "the product, your ratings and review text, your name, job title, industry, company size and how long you have used the product." },
            { title: "Listing claims and vendor interest", body: "your name, work email, company, company website, role and the product concerned." },
          ]}
        />
        <LegalSubhead>Stored automatically in your browser</LegalSubhead>
        <LegalList
          items={[
            { title: "Saved products", body: "the shortlist you build with the Save button." },
            { title: "Compare list", body: "the products you add to a comparison." },
            { title: "Form entries", body: "the form entries above, up to the latest 100." },
          ]}
        />
        <LegalSubhead>Collected automatically by our server</LegalSubhead>
        <LegalP>
          Like any website, the server that delivers these pages receives the technical details your browser sends with
          each request: your IP address, browser and device type, the page requested, the referring page and the time.
          We add nothing to these and run no analytics on them.
        </LegalP>
      </>
    ),
  },
  {
    id: "use",
    heading: "How we use information",
    body: (
      <>
        <LegalP>We use information to:</LegalP>
        <LegalList
          items={[
            { body: "Show your saved products, compare list and draft entries when you come back (in your browser only)." },
            { body: "Deliver pages, keep the site secure and diagnose faults, using the server request details." },
            { body: "After launch: respond to enquiries, publish verified reviews, pass buyer requests to the vendor you choose and send newsletters you sign up for." },
            { body: "Comply with legal obligations and protect our rights and the rights of others." },
          ]}
        />
        <LegalP>
          <strong className="font-semibold text-navy">We do not sell personal information</strong>, and we never use it
          to decide how products are ranked or which products our editors recommend.
        </LegalP>
      </>
    ),
  },
  {
    id: "reviews-vendors",
    heading: "Reviews, vendors and buyer requests",
    body: (
      <>
        <LegalP>
          These features open at launch. Before they do, this section will be expanded. These rules will apply:
        </LegalP>
        <LegalList
          items={[
            { title: "Reviewer verification", body: "details used to check that a reviewer is a real user (such as a work email) are used only for verification and are never published or given to vendors." },
            { title: "Published reviews", body: "show the review, the ratings and how it was verified. Your name and company are shown only if you choose; your email address never is." },
            { title: "Buyer requests", body: "a demo or contact request goes only to the vendor you choose, with only the details you choose to share." },
            { title: "Vendors", body: "see aggregate counts of profile views and website clicks, never tied to an individual visitor. Paying for a vendor plan never changes how reviews are treated or how products are ordered." },
          ]}
        />
      </>
    ),
  },
  {
    id: "sharing",
    heading: "How we share information",
    body: (
      <>
        <LegalP>
          Today, nothing you enter in a form reaches us, so there is nothing for us to share. Once personal information
          is held on our systems, it may be shared only with:
        </LegalP>
        <LegalList
          items={[
            { title: "Service providers", body: "for hosting, email and communications, bound by confidentiality and security obligations and allowed to use it only to provide their service to us." },
            { title: "Vendors you choose", body: "when you send a buyer request to them." },
            { title: "Professional advisers", body: "such as lawyers, auditors and insurers." },
            { title: "Authorities", body: "where the law requires it, or to protect rights and safety." },
            { title: "A successor business", body: "in a merger, acquisition or restructuring, with notice where required." },
          ]}
        />
        <LegalP>
          Product profiles link to vendors&rsquo; own websites. When you follow one you leave Faresolution, and the
          vendor&rsquo;s privacy policy applies.
        </LegalP>
      </>
    ),
  },
  {
    id: "security",
    heading: "Data security",
    body: (
      <>
        <LegalP>
          The site is served only over HTTPS, loads no third-party scripts, and serves its own fonts and images, so
          viewing a page does not contact other companies. Once we hold personal information, we will protect it with
          reasonable technical and organisational measures, including access controls and least-privilege access.
        </LegalP>
        <LegalP>
          Information in your browser&rsquo;s storage is available to anyone who uses your browser profile, so clear it
          on a shared device. No system is completely secure; if a breach affects your personal information we will
          notify you and the authorities as the law requires.
        </LegalP>
      </>
    ),
  },
  {
    id: "retention",
    heading: "Retention",
    body: (
      <>
        <LegalList
          items={[
            { title: "Browser storage", body: "kept until you clear it or remove items yourself. Form entries are capped at the latest 100; older ones are removed automatically." },
            { title: "Server request details", body: <Placeholder>log contents and retention period</Placeholder> },
            { title: "After launch", body: "enquiries are kept while a conversation is active and for a reasonable period after; newsletter details until you unsubscribe; longer only where the law requires." },
          ]}
        />
      </>
    ),
  },
  {
    id: "rights",
    heading: "Your rights and choices",
    body: (
      <>
        <LegalP>
          Under India&rsquo;s Digital Personal Data Protection Act, 2023, and other laws such as the GDPR where they
          apply, you have the right to:
        </LegalP>
        <LegalList
          items={[
            { body: "Access the personal information we hold about you, and ask for it to be corrected or erased." },
            { body: "Withdraw consent for any processing that relies on it, as easily as you gave it." },
            { body: "Nominate another person to exercise your rights if you die or become unable to." },
            { body: "Have a grievance addressed, and complain to the Data Protection Board of India if you are not satisfied." },
          ]}
        />
        <LegalP>
          Because the site&rsquo;s forms currently store entries only in your browser, you can see and erase that
          information yourself: clear this site&rsquo;s data in your browser settings, use a review draft&rsquo;s Clear
          draft button, or unsave products. For anything else, write to {email}. We respond within the time the law
          requires.
        </LegalP>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: (
      <>
        <LegalP>
          The site&rsquo;s own code sets <strong className="font-semibold text-navy">no cookies</strong> and runs no
          analytics or advertising, so there is no cookie banner to accept. It uses your browser&rsquo;s local storage
          for the features below; this stays on your device and is never sent to our server.
        </LegalP>
        <LegalTable
          caption="Browser storage used by Faresolution"
          columns={["Name", "Type", "Purpose", "When it is set"]}
          rows={[
            ["faresolution:saved-products", "Local storage, necessary", "Remembers the products you saved.", "When you press Save on a product."],
            ["faresolution:compare", "Local storage, necessary", "Remembers the products in your comparison.", "When you add a product to compare."],
            ["faresolution:submissions", "Local storage, necessary", "Keeps what you entered in the site's forms.", "When you submit a form or save a review draft."],
          ]}
        />
        <LegalP>
          If cookies or analytics are ever introduced, this table will be updated first, and any that are not strictly
          necessary will be set only after you agree.
        </LegalP>
      </>
    ),
  },
  {
    id: "international",
    heading: "International transfers",
    body: (
      <LegalP>
        Information in your browser never leaves your device. Server request details are processed where the site is
        hosted: <Placeholder>hosting provider and country</Placeholder>. If we later use service providers in other
        countries, we will do so only as Indian law permits and with appropriate safeguards.
      </LegalP>
    ),
  },
  {
    id: "children",
    heading: "Children’s privacy",
    body: (
      <LegalP>
        Faresolution is meant for people choosing software for work and is not directed at children. We do not knowingly
        collect personal information from anyone under 18. If you believe a child has given us personal information,
        contact us and we will delete it.
      </LegalP>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    body: (
      <LegalP>
        We will update this policy before any feature that collects personal information opens, and whenever our
        practices change. The &ldquo;Last updated&rdquo; date at the top will change with it, and material changes will
        be announced on the site.
      </LegalP>
    ),
  },
  {
    id: "contact",
    heading: "Contact us and grievances",
    body: (
      <>
        <LegalP>
          For questions about this policy, a request about your information or a grievance, contact us at {email}, call{" "}
          <a href={OWNER_CONTACT.phoneHref} className={link}>
            {OWNER_CONTACT.phone}
          </a>
          . The{" "}
          <Link href="/contact" className={link}>
            contact form
          </Link>{" "}
          is not connected to email yet (entries stay in your browser), so please write or call directly for now.
        </LegalP>
        <LegalP>
          Grievance officer: <Placeholder>name and designation</Placeholder>.
        </LegalP>
      </>
    ),
  },
];

const FAQ: FaqItem[] = [
  {
    q: "Does Faresolution sell my data?",
    a: "No. We do not sell personal information to vendors, advertisers or anyone else, and paying vendors never receive visitor data.",
  },
  {
    q: "What information does Faresolution collect?",
    a: "Today, the forms and your saved and compare lists are stored only in your own browser. Our server receives the standard request details every website receives, such as your IP address and browser type.",
  },
  {
    q: "Does the site use cookies or analytics?",
    a: "No. The site's own code sets no cookies and runs no analytics, advertising or social media tracking. It uses your browser's local storage for saved products, your compare list and form entries.",
  },
  {
    q: "What are my rights under the DPDP Act?",
    a: "You can access your personal information, ask for it to be corrected or erased, withdraw consent, nominate someone to act for you and have a grievance addressed.",
  },
  {
    q: "How do I make a request or complaint?",
    a: `Email ${OWNER_CONTACT.email}. Data stored in your browser can be removed at any time by clearing this site's data in your browser settings.`,
  },
  {
    q: "Will vendors see who viewed their product?",
    a: "No. Vendors will only see aggregate counts of views and clicks, never tied to an individual. A buyer request reaches a vendor only when you choose to send it.",
  },
  {
    q: "How long is information kept?",
    a: "Browser storage stays until you clear it, with form entries capped at the latest 100. After launch, enquiries are kept for as long as needed to handle them and newsletter details until you unsubscribe.",
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title={title}
      intro={
        <p>
          How Faresolution handles information across the site: what your browser stores, what reaches our server, your
          rights, and what will change at launch.
        </p>
      }
      startId="collection"
      chips={["DPDP Act", "No tracking", "Your rights", "Security"]}
      effectiveDate={EFFECTIVE}
      updatedDate={UPDATED}
      notice={<LegalDraftNotice />}
      glance={GLANCE}
      sections={SECTIONS}
      faq={FAQ}
      related={[
        { title: "Terms of use", body: "What the directory is and how its information may be used.", href: "/terms" },
        { title: "Review guidelines", body: "How reviews are collected, checked and published.", href: "/review-guidelines" },
        { title: "Questions?", body: "Contact us about privacy, your data or anything else.", href: "/contact" },
      ]}
      contactEmail={{ label: OWNER_CONTACT.email, href: OWNER_CONTACT.emailHref }}
    />
  );
}
