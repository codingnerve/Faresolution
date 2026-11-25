import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Container } from "@/components/ui/Container";

/** Newsletter sign-up band above the footer. */
export function NewsletterBand() {
  return (
    <section aria-labelledby="home-newsletter-title" className="border-t border-line bg-surface-alt">
      <Container className="grid gap-8 py-14 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <p className="type-label mb-3">Newsletter</p>
          <h2 id="home-newsletter-title" className="type-h2 text-navy">
            New buying guides, straight to your inbox
          </h2>
          <p className="type-body mt-3 text-subtle">
            Category research, comparison updates and checklists for your next
            software decision, sent by email once the newsletter launches.
          </p>
        </div>
        <NewsletterForm source="home" />
      </Container>
    </section>
  );
}
