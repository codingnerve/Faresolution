import type { Metadata } from "next";
import { CompanyHeader, LegalDraftNotice, Placeholder } from "@/components/company/CompanyHeader";
import { PolicyPage, type PolicySection } from "@/components/reviews/PolicyPage";
import { SITE_NAME } from "@/lib/utils";

const title = "Privacy notice";
const description =
  "Draft privacy notice for the Faresolution demonstration site: no accounts, no tracking, and what your browser stores (saved products, your compare list and form entries).";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/privacy", title, description },
};

const SECTIONS: PolicySection[] = [
  {
    id: "scope",
    heading: "What this notice covers",
    paragraphs: [
      "This notice describes how the Faresolution demonstration site handles information today. The site is a preview of a software directory before launch.",
      <>
        The organisation responsible for the site is <Placeholder>operator legal name and address</Placeholder>.
      </>,
      "It will be rewritten before Faresolution collects any personal information on its own systems, such as for accounts, newsletters or reviews.",
    ],
  },
  {
    id: "summary",
    heading: "In short",
    items: [
      { title: "No accounts", body: "There is no sign-up or sign-in. Nothing you do on the site is linked to a profile." },
      { title: "Forms stay in your browser", body: "The newsletter, contact, review draft, listing claim and vendor interest forms store what you enter in your own browser. Nothing is sent to us or to any vendor." },
      { title: "No tracking", body: "The site uses no analytics, advertising or social media tracking, and loads no third-party scripts." },
      { title: "No cookies from our code", body: "The site's own code sets no cookies. See Cookies below." },
    ],
  },
  {
    id: "browser",
    heading: "What your browser stores",
    paragraphs: [
      "The site uses your browser's local storage, which stays on your device and is not sent to our servers. We cannot see or retrieve it. It holds:",
    ],
    items: [
      { title: "Saved products", body: "The products you save with the Save button, so your shortlist is there when you come back." },
      { title: "Your compare list", body: "The products you have added to a comparison." },
      { title: "Form entries", body: "What you enter in the site's forms: newsletter email addresses, contact messages, review drafts, listing claim requests and vendor interest entries. Up to 100 entries are kept; the oldest are removed after that." },
    ],
  },
  {
    id: "clearing",
    heading: "Removing what is stored",
    paragraphs: [
      "You can remove everything at any time by clearing this site's data in your browser's settings (often listed as site data, or cookies and site data). A review draft can also be removed with its Clear draft button, and products can be unsaved or removed from a comparison on the page.",
      "If your browser blocks storage, for example in some private browsing modes, the site still works. What you enter is then kept only until you leave or reload the page, and the forms say so.",
    ],
  },
  {
    id: "server",
    heading: "What reaches the server",
    paragraphs: [
      <>
        Like any website, the server that delivers these pages receives the technical details your browser sends with
        each request, such as your IP address, browser type and the page requested. The site does not add anything to
        them. Whether these details are logged, and for how long:{" "}
        <Placeholder>hosting provider, server log contents and retention period</Placeholder>.
      </>,
      "Searches, filters and comparisons are worked out in your browser or from the page address, not stored by us.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    paragraphs: [
      "The site's own code sets no cookies, and no page needs one to work. If that changes, for example when accounts are introduced, this notice will be updated first and will list each cookie and its purpose.",
    ],
  },
  {
    id: "third-parties",
    heading: "Other sites and services",
    paragraphs: [
      "Fonts and images are served from this site, so viewing a page does not contact a font or image provider. Product logos are generated marks drawn by the site, not files fetched from vendors.",
      "Product profiles link to vendors' own websites. When you follow one of those links you leave this site, and the vendor's own privacy terms apply.",
    ],
  },
  {
    id: "launch",
    heading: "When the site launches",
    paragraphs: [
      "Accounts, the newsletter, review collection, listing claims and buyer requests will involve personal information held on Faresolution's systems. Before any of them opens, this notice will say what is collected and why, who it is shared with, how long it is kept, where it is processed and how you can see, correct or delete it.",
      "Reviewers' verification details will be used only to check reviews and will not be published. Buyer requests will go only to the vendor the buyer chose.",
    ],
  },
  {
    id: "children",
    heading: "Children",
    paragraphs: ["The site is meant for people choosing software for work. It is not directed at children."],
  },
  {
    id: "contact",
    heading: "Questions",
    paragraphs: [
      "You can use the contact form and choose “Privacy or my data”. Because the demo isn't connected to email yet, the message is kept in your browser and not received by anyone.",
      <>
        Privacy contact: <Placeholder>a monitored privacy contact address</Placeholder>.
      </>,
    ],
  },
  {
    id: "changes",
    heading: "Changes to this notice",
    paragraphs: [
      "This is a working draft. When it changes, the date at the top will change with it, and material changes will be summarised here.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <CompanyHeader
        eyebrow="Legal"
        title="Privacy notice"
        intro={<p>How this demonstration site handles information: what your browser stores, what it doesn&rsquo;t, and what will change at launch.</p>}
      >
        <LegalDraftNotice />
      </CompanyHeader>
      <PolicyPage sections={SECTIONS} />
    </>
  );
}
