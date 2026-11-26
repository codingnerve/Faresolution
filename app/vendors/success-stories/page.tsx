import { BookOpenCheck } from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { VendorsHeader } from "@/components/vendors/VendorsHeader";
import { SITE_NAME } from "@/lib/utils";

const title = "Success stories";
const description =
  "Vendor success stories on Faresolution: none are published yet. What a story will contain and the criteria it must meet before it is published.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/vendors/success-stories" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/vendors/success-stories", title, description },
};

const CONTENTS = [
  { title: "The starting point", body: "What the vendor wanted from its listing, and how it was handling buyer interest before." },
  { title: "What changed", body: "The steps it took on Faresolution, such as correcting facts, answering reviews or taking a plan." },
  { title: "What happened", body: "Outcomes the vendor can show from its own records, with the period they cover." },
  { title: "What didn't work", body: "The limits and the things it would do differently, so the story is useful rather than flattering." },
];

const CRITERIA = [
  "The vendor is named and has approved the story in writing, including every figure in it.",
  "Every figure comes from records the vendor can produce, covers a stated period and is not rounded up.",
  "Results are not described as typical, and the story says what else changed in the same period.",
  "Customers or reviewers are only named with their own permission.",
  "A story that is part of a paid arrangement is labelled Sponsored, like any other placement.",
  "Stories are dated, and are updated or removed if the facts they rely on change.",
];

export default function SuccessStoriesPage() {
  return (
    <>
      <VendorsHeader
        current="/vendors/success-stories"
        title="Success stories"
        intro={
          <p>
            Accounts from vendors of what working with Faresolution changed for them. The vendor programme hasn&rsquo;t
            opened, so there are none yet, and we will not publish an invented one.
          </p>
        }
      />

      <Container className="py-12 sm:py-16">
        <EmptyState
          icon={BookOpenCheck}
          title="No published stories yet"
          description="Stories can only come from vendors who have used the programme, which opens at launch. Below is what each story will contain and the standard it will have to meet."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button href="/vendors/register">Register interest</Button>
              <Button href="/vendors" variant="secondary">
                About the programme
              </Button>
            </div>
          }
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <section aria-labelledby="stories-contents-title">
            <p className="type-label mb-3">Structure</p>
            <h2 id="stories-contents-title" className="type-h2 text-navy">
              What a story will contain
            </h2>
            <ol className="mt-6 border-t border-line">
              {CONTENTS.map((item, index) => (
                <li key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-b border-line py-5">
                  <span aria-hidden="true" className="font-serif text-[1.5rem] leading-none text-violet-ink tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="type-h3 text-navy">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-subtle">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="stories-criteria-title">
            <p className="type-label mb-3">Standard</p>
            <h2 id="stories-criteria-title" className="type-h2 text-navy">
              Criteria for publishing
            </h2>
            <ul className="mt-6 space-y-3">
              {CRITERIA.map((criterion) => (
                <li key={criterion} className="rounded-md border border-line bg-surface-alt px-4 py-3 text-sm leading-6 text-ink">
                  {criterion}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </>
  );
}
