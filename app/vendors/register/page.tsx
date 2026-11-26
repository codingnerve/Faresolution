import type { Metadata } from "next";
import Link from "next/link";
import { VendorInterestForm } from "@/components/forms/VendorInterestForm";
import { Container } from "@/components/ui/Container";
import { VendorProgrammeStatus, VendorsHeader } from "@/components/vendors/VendorsHeader";
import { buildMetadata } from "@/lib/seo";

const title = "Register interest";
const description =
  "Register interest in the Faresolution vendor programme, which opens at launch. In this demo nothing is sent, so this does not put you on a list; no account is created.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/vendors/register" });

const AT_LAUNCH = [
  {
    title: "Programme opens",
    body: "Plans and pricing will be published on the plans page before any plan can be bought, and registering interest will add you to the waitlist.",
  },
  {
    title: "Vendor accounts",
    body: "Accounts will be created at that point, with a check that you work for the company you name.",
  },
  {
    title: "Claims and corrections",
    body: "You will be able to claim your product's listing and correct its facts. Changes will be checked before they appear.",
  },
];

export default function VendorRegisterPage() {
  return (
    <>
      <VendorsHeader
        current="/vendors/register"
        title="Register interest"
        intro={
          <p>
            Tell us you are interested in the vendor programme. In this demo nothing is sent, so this does not put you
            on a list; at launch, registering will add you to the waitlist. No account is created, no password is set
            and nothing is charged.
          </p>
        }
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
          <section aria-labelledby="register-form-title" className="min-w-0">
            <h2 id="register-form-title" className="type-h2 text-navy">
              Your details
            </h2>
            <p className="type-body mt-2 max-w-2xl text-subtle">
              Saving keeps this entry only in this browser, because the demo isn&rsquo;t connected to email yet. Nobody
              at Faresolution receives it.
            </p>
            <div className="mt-8 rounded-lg border border-line bg-surface p-5 shadow-card sm:p-7">
              <VendorInterestForm source="register" />
            </div>
          </section>

          <aside aria-labelledby="register-launch-title" className="space-y-6">
            <VendorProgrammeStatus />
            <div>
              <h2 id="register-launch-title" className="type-h3 text-navy">
                What will happen at launch
              </h2>
              <ol className="mt-4 border-t border-line">
                {AT_LAUNCH.map((step, index) => (
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
              Already listed?{" "}
              <Link href="/vendors/claim-listing" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
                Prepare a listing claim
              </Link>
              , or compare the{" "}
              <Link href="/vendors/pricing" className="rounded-xs text-blue-ink underline underline-offset-2 hover:text-navy">
                vendor plans
              </Link>
              .
            </p>
          </aside>
        </div>
      </Container>
    </>
  );
}
