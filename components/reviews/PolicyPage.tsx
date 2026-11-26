import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export interface PolicySection {
  id: string;
  heading: string;
  /** Plain text, or rich content such as a marked placeholder. */
  paragraphs?: ReactNode[];
  items?: { title?: string; body: string }[];
}

/**
 * Long-form policy copy as numbered sections with an in-page contents list.
 * Every section is wording for the policy that will apply at launch.
 */
export function PolicyPage({ sections }: { sections: PolicySection[] }) {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <p className="type-label mb-3">On this page</p>
          <ol className="space-y-2 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="rounded-xs text-ink hover:text-blue-ink">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-reading space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24">
              <h2 id={`${section.id}-title`} className="type-h2 text-navy">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph, index) => (
                <p key={`${section.id}-${index}`} className="type-body mt-3 text-ink">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-4 space-y-3 border-t border-line">
                  {section.items.map((item) => (
                    <li key={item.title ?? item.body} className="border-b border-line py-3">
                      {item.title && <p className="text-sm font-semibold text-navy">{item.title}</p>}
                      <p className={item.title ? "type-body mt-1 text-subtle" : "type-body text-ink"}>{item.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
