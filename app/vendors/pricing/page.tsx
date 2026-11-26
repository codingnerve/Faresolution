import { Check, Minus } from "lucide-react";
import type { Metadata } from "next";
import { VendorInterestForm } from "@/components/forms/VendorInterestForm";
import { Container } from "@/components/ui/Container";
import { Faq } from "@/components/ui/Faq";
import { VendorProgrammeStatus, VendorsHeader } from "@/components/vendors/VendorsHeader";
import { PLAN_CAPABILITIES, PLAN_PRICING_STATUS, VENDOR_PLANS, planIncludes } from "@/lib/data/content/plans";
import type { FaqItem } from "@/lib/data/types";
import { buildMetadata } from "@/lib/seo";

const title = "Vendor plans";
const description =
  "The plans Faresolution will offer software vendors at launch, who each is for and what it includes. Pricing will be announced at launch; register your interest now.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/vendors/pricing" });

const NEVER_FOR_SALE = [
  { title: "Reviews", body: "No plan will let a vendor edit, hide, reorder or remove a review, or change how reviews are checked." },
  { title: "Ratings", body: "Ratings will be calculated only from published reviews, the same way for every product." },
  { title: "Organic order", body: "Directory, category and search results will follow the buyer's own filters and sort, never a plan." },
  { title: "Editorial picks", body: "Shortlists, buying guides and research will be written by the editors and cannot be bought." },
];

const FAQ: FaqItem[] = [
  {
    q: "Why are there no prices?",
    a: "Because none have been set. We would rather show nothing than a number we might change. Pricing will be announced at launch and published on this page before any plan can be bought.",
  },
  {
    q: "Will my product stay listed if I don't take a plan?",
    a: "Yes. Listings do not depend on a plan. Every product in the directory keeps its profile, its place in categories, comparisons and alternatives, and its reviews once collection opens.",
  },
  {
    q: "Does a plan improve my product's ranking or rating?",
    a: "No. Organic results follow the buyer's filters and sort, and ratings come only from published reviews. Sponsored placements, in the plan that includes them, will always be labelled Sponsored and kept apart from organic results.",
  },
  {
    q: "What does registering interest commit me to?",
    a: "Nothing. In this demo nothing is sent, so registering does not put you on a list: your entry is kept only in your browser, no account is created and nobody will contact you from it. At launch, registering interest will add you to the waitlist for the programme.",
  },
  {
    q: "When can I claim my listing?",
    a: "Claims open at launch. Claiming and maintaining your profile is included in every plan. You can prepare a claim request today; it is stored only in your browser.",
  },
  {
    q: "How will buyer requests work?",
    a: "A buyer will choose to contact you from your profile and see what will be shared before confirming. Requests will go only to the product's vendor and will never be sold or shared with other vendors.",
  },
];

export default function VendorPricingPage() {
  const groups = [...new Set(PLAN_CAPABILITIES.map((capability) => capability.group))];

  return (
    <>
      <VendorsHeader
        current="/vendors/pricing"
        title="Vendor plans"
        intro={
          <p>
            Three plans for the vendor programme that opens at launch: who each is for and what it will include.{" "}
            {PLAN_PRICING_STATUS}; nothing can be bought yet.
          </p>
        }
      />

      <section aria-labelledby="plans-title" className="py-12 sm:py-16">
        <Container>
          <h2 id="plans-title" className="sr-only">
            Plans
          </h2>
          <ul className="grid gap-5 lg:grid-cols-3">
            {VENDOR_PLANS.map((plan, index) => {
              const previous = index > 0 ? VENDOR_PLANS[index - 1] : null;
              const added = plan.capabilities.filter((id) => !previous || !planIncludes(previous, id));
              return (
                <li
                  key={plan.id}
                  className="flex flex-col rounded-lg border border-line bg-surface p-6 shadow-card sm:p-7"
                >
                  <h3 className="font-serif text-[1.75rem] leading-tight font-[440] text-navy">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink">{plan.audience}</p>
                  <p className="mt-5 rounded-md border border-line bg-surface-alt px-3 py-2 text-sm font-medium text-navy">
                    {PLAN_PRICING_STATUS}
                  </p>
                  <p className="type-label mt-6">{previous ? `Everything in ${previous.name}, plus` : "Includes"}</p>
                  <ul className="mt-3 space-y-2.5">
                    {added.map((id) => {
                      const capability = PLAN_CAPABILITIES.find((c) => c.id === id);
                      return capability ? (
                        <li key={id} className="flex items-start gap-2.5 text-sm leading-6 text-ink">
                          <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-success" strokeWidth={2} />
                          {capability.label}
                        </li>
                      ) : null;
                    })}
                  </ul>
                  <a
                    href="#register-interest"
                    className="mt-auto inline-flex items-center gap-1.5 self-start rounded-xs pt-6 text-sm font-medium text-blue-ink hover:text-navy"
                  >
                    Register interest
                  </a>
                </li>
              );
            })}
          </ul>
          <VendorProgrammeStatus className="mt-8">
            Every capability on this page is planned for launch; none is available today. Plans and what they include may
            still change before then, and pricing has not been set.
          </VendorProgrammeStatus>
        </Container>
      </section>

      <section aria-labelledby="compare-plans-title" className="border-t border-line bg-surface-alt py-12 sm:py-16">
        <Container>
          <p className="type-label mb-3">Side by side</p>
          <h2 id="compare-plans-title" className="type-h2 text-navy">
            What each plan will include
          </h2>
          <div
            role="region"
            aria-labelledby="compare-plans-title"
            tabIndex={0}
            className="relative mt-8 overflow-x-auto rounded-lg border border-line bg-surface shadow-card"
          >
            <table className="w-full min-w-[19rem] table-fixed border-collapse text-left text-sm sm:min-w-[40rem]">
              <caption className="sr-only">
                Capabilities included in each vendor plan. {PLAN_PRICING_STATUS}.
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 w-[40%] bg-surface px-3 py-3.5 font-semibold text-navy sm:static sm:w-[46%] sm:px-5"
                  >
                    Capability
                  </th>
                  {VENDOR_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      scope="col"
                      className="px-1 py-3.5 text-center text-xs font-semibold text-navy sm:px-5 sm:text-sm"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((group) => (
                <tbody key={group} className="border-b border-line last:border-b-0">
                  <tr className="bg-surface-alt">
                    <th
                      scope="colgroup"
                      colSpan={VENDOR_PLANS.length + 1}
                      className="px-3 py-2 text-xs font-semibold tracking-[0.08em] text-subtle uppercase sm:px-5"
                    >
                      <span className="sticky left-3">{group}</span>
                    </th>
                  </tr>
                  {PLAN_CAPABILITIES.filter((capability) => capability.group === group).map((capability) => (
                    <tr key={capability.id} className="border-t border-line">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-surface px-3 py-3.5 align-top font-normal sm:static sm:px-5"
                      >
                        <span className="block font-medium text-navy">{capability.label}</span>
                        {/* Phones get these in the list below the table, where they fit. */}
                        <span className="type-meta mt-0.5 hidden sm:block">{capability.description}</span>
                      </th>
                      {VENDOR_PLANS.map((plan) => {
                        const included = planIncludes(plan, capability.id);
                        return (
                          <td key={plan.id} className="px-1 py-3.5 text-center align-top sm:px-5">
                            {included ? (
                              <Check aria-hidden="true" className="mx-auto size-4 text-success" strokeWidth={2.25} />
                            ) : (
                              <Minus aria-hidden="true" className="mx-auto size-4 text-muted" strokeWidth={2} />
                            )}
                            <span className="sr-only">{included ? "Included" : "Not included"}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <div className="mt-8 sm:hidden">
            <h3 className="type-h3 text-navy">What each capability means</h3>
            <dl className="mt-3 divide-y divide-line border-y border-line">
              {PLAN_CAPABILITIES.map((capability) => (
                <div key={capability.id} className="py-3">
                  <dt className="text-sm font-medium text-navy">{capability.label}</dt>
                  <dd className="type-meta mt-0.5">{capability.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section aria-labelledby="not-for-sale-title" className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="type-label mb-3">Independence</p>
              <h2 id="not-for-sale-title" className="type-h2 text-navy">
                What no plan will buy
              </h2>
              <p className="type-body mt-3 text-subtle">
                Buyers can only trust the directory if paid and organic stay separate. These rules apply to every plan.
              </p>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {NEVER_FOR_SALE.map((rule) => (
                <div key={rule.title} className="bg-surface p-5 sm:p-6">
                  <dt className="type-h3 text-navy">{rule.title}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-subtle">{rule.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section aria-labelledby="pricing-faq-title" className="border-t border-line py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="type-label mb-3">Questions</p>
            <h2 id="pricing-faq-title" className="type-h2 text-navy">
              Plans and pricing FAQ
            </h2>
          </div>
          <Faq items={FAQ} />
        </Container>
      </section>

      <section
        id="register-interest"
        aria-labelledby="register-interest-title"
        className="scroll-mt-20 border-t border-line bg-surface-alt py-12 sm:py-16"
      >
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="type-label mb-3">Register interest</p>
            <h2 id="register-interest-title" className="type-h2 text-navy">
              Register your interest
            </h2>
            <p className="type-body mt-3 text-subtle">
              Tell us which plan fits. In this demo nothing is sent, so this does not put you on a list: your entry stays
              in your browser and no account is created.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-5 shadow-card sm:p-7">
            <VendorInterestForm source="pricing" />
          </div>
        </Container>
      </section>
    </>
  );
}
