import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Columns3, PenLine } from "lucide-react";
import Link from "next/link";
import { articleIndexHref } from "@/components/layout/navigation";
import { Tilt } from "@/components/motion/Tilt";
import { Container } from "@/components/ui/Container";

interface NextStep {
  title: string;
  body: string;
  href: string;
  icon: LucideIcon;
}

const STEPS: NextStep[] = [
  {
    title: "Build a comparison",
    body: "Pick two to four products and see plans, deployment and features side by side.",
    href: "/compare",
    icon: Columns3,
  },
  {
    title: "Read a buying guide",
    body: "What to settle before you sign, written category by category.",
    href: articleIndexHref["buying-guide"],
    icon: BookOpen,
  },
  {
    title: "Claim your listing",
    body: "For vendors: claim your product's profile and send us corrections.",
    href: "/vendors/claim-listing",
    icon: PenLine,
  },
];

/** Closing band: the next useful steps, each a real route. */
export function ClosingCta() {
  return (
    <section aria-labelledby="home-next-title" className="border-t border-line bg-surface-alt">
      <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="type-label mb-3">Next steps</p>
          <h2 id="home-next-title" className="type-h2 text-navy">
            Ready to narrow it down?
          </h2>
        </div>

        <ul className="reveal-stagger grid gap-4 md:grid-cols-3">
          {STEPS.map(({ title, body, href, icon: Icon }) => (
            <li key={href}>
              <Tilt max={7}>
                <Link
                  href={href}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-overlay sm:p-6"
                >
                  <span className="flex size-10 items-center justify-center rounded-md bg-blue-tint transition-colors duration-300 group-hover:bg-blue">
                    <Icon aria-hidden="true" className="size-5 text-blue transition-colors duration-300 group-hover:text-white" strokeWidth={1.75} />
                  </span>
                  <span className="mt-4 flex items-center gap-1.5 text-[0.9375rem] font-semibold text-navy group-hover:text-blue-ink">
                    {title}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="mt-1.5 text-[0.8125rem] leading-5 text-subtle">{body}</span>
                </Link>
              </Tilt>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
