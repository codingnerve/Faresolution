import type { Metadata } from "next";
import Link from "next/link";
import { ClaimListingForm } from "@/components/forms/ClaimListingForm";
import { Container } from "@/components/ui/Container";
import { VendorProgrammeStatus, VendorsHeader } from "@/components/vendors/VendorsHeader";
import { buildMetadata } from "@/lib/seo";

const title = "Claim a listing";
const description =
  "Find your product in the Faresolution directory and prepare a claim request. Claims open at launch, when ownership will be checked before any listing changes.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/vendors/claim-listing" });

const VERIFICATION_STEPS = [
  {
    title: "Your request",
    body: "You will name the product, your role and a work email. Requests from a company domain will be the quickest to check.",
  },
  {
    title: "Ownership check",
    body: "We will confirm you can act for the vendor, for example by an email to an address at the product's domain or a record added to the vendor's website.",
  },
  {
    title: "Access to the listing",
    body: "Once confirmed, you will be able to correct the listing's facts and respond to reviews. Fact changes will be checked before they appear.",
  },
];

export default function ClaimListingPage() {
  return (
    <>
      <VendorsHeader
        current="/vendors/claim-listing"
        title="Claim a listing"
        intro={
          <p>
            Find your product and prepare a claim request. Claims open at launch; until then a request is kept only in
            your browser, and no listing changes.
          </p>
        }
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <section aria-labelledby="claim-form-title" className="min-w-0">
            <h2 id="claim-form-title" className="type-h2 text-navy">
              Your claim request
            </h2>
            <p className="type-body mt-2 max-w-2xl text-subtle">
              Search the directory for the product you represent. If it isn&rsquo;t listed,{" "}
              <Link href="/contact" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
                tell us about it
              </Link>
              .
            </p>
            <div className="mt-8 rounded-lg border border-line bg-surface p-5 shadow-card sm:p-7">
              <ClaimListingForm />
            </div>
          </section>

          <aside aria-labelledby="claim-how-title" className="space-y-6">
            <VendorProgrammeStatus>
              Claims are not reviewed yet and no vendor can edit a listing today. Every listing is sample data, marked as
              not verified with its vendor.
            </VendorProgrammeStatus>
            <div>
              <h2 id="claim-how-title" className="type-h3 text-navy">
                How claims will be verified
              </h2>
              <ol className="mt-4 border-t border-line">
                {VERIFICATION_STEPS.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-line py-4">
                    <span aria-hidden="true" className="font-serif text-xl leading-none text-violet-ink tabular-nums">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-subtle">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <p className="type-meta">
              Read{" "}
              <Link href="/vendors/resources" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
                what to have ready
              </Link>{" "}
              before claims open.
            </p>
          </aside>
        </div>
      </Container>
    </>
  );
}
