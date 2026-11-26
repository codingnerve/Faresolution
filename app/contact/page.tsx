import type { Metadata } from "next";
import Link from "next/link";
import { CompanyHeader } from "@/components/company/CompanyHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { SITE_NAME } from "@/lib/utils";

const title = "Contact";
const description =
  "Write to Faresolution about the directory, a listing correction, the vendor programme or your data. This demo isn't connected to email yet, so messages stay in your browser.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/contact", title, description },
};

const GUIDES = [
  {
    title: "Asking for a demo",
    body: "Requests aren't passed to vendors yet. Every product profile links to the vendor's own website, which is the quickest route today.",
    href: "/software",
    link: "Find a product",
  },
  {
    title: "Correcting a listing",
    body: "Say which fact is wrong and where the right one is published. Vendors can also prepare a claim for their listing.",
    href: "/vendors/claim-listing",
    link: "Prepare a listing claim",
  },
  {
    title: "About reviews",
    body: "Review collection isn't open yet. The guidelines describe how reviews will be handled when it does.",
    href: "/review-guidelines",
    link: "Review guidelines",
  },
  {
    title: "Your data",
    body: "The site keeps nothing about you on a server. The privacy notice lists what your browser stores and how to clear it.",
    href: "/privacy",
    link: "Privacy notice",
  },
];

export default function ContactPage() {
  return (
    <>
      <CompanyHeader
        eyebrow="Company"
        title="Contact"
        intro={
          <p>
            Questions, corrections and ideas are welcome. Be aware that this demo isn&rsquo;t connected to email yet:
            your message is kept only in your browser and nobody receives it.
          </p>
        }
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <section aria-labelledby="contact-form-title" className="min-w-0">
            <h2 id="contact-form-title" className="type-h2 text-navy">
              Write to us
            </h2>
            <p className="type-body mt-2 max-w-2xl text-subtle">All fields are required unless marked optional.</p>
            <div className="mt-8 rounded-lg border border-line bg-surface p-5 shadow-card sm:p-7">
              <ContactForm />
            </div>
          </section>

          <aside aria-labelledby="contact-guides-title">
            <h2 id="contact-guides-title" className="type-h3 text-navy">
              Before you write
            </h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {GUIDES.map((guide) => (
                <li key={guide.title} className="py-4">
                  <p className="text-sm font-semibold text-navy">{guide.title}</p>
                  <p className="mt-1 text-sm leading-6 text-subtle">{guide.body}</p>
                  <Link
                    href={guide.href}
                    className="mt-2 inline-block rounded-xs text-sm font-medium text-blue-ink underline-offset-2 hover:text-navy hover:underline"
                  >
                    {guide.link}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Container>
    </>
  );
}
