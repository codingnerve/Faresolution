import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Columns3, PenLine } from "lucide-react";
import Link from "next/link";
import { articleIndexHref } from "@/components/layout/navigation";
import { Tilt } from "@/components/motion/Tilt";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { accent, Eyebrow } from "./accents";

const STEP_TONES = [
  { ...accent("blue"), groupHoverSolid: "group-hover:bg-blue" },
  { ...accent("violet"), groupHoverSolid: "group-hover:bg-violet" },
  { ...accent("coral"), groupHoverSolid: "group-hover:bg-coral" },
];

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
    <section
      aria-labelledby="home-next-title"
      className="relative isolate overflow-hidden bg-linear-to-br from-blue-tint via-violet-tint to-coral-tint"
    >
      <div aria-hidden="true" className="color-mesh -z-10" />
      <div aria-hidden="true" className="brand-rule absolute inset-x-0 top-0" />
      <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div>
          <p className="type-label mb-3">
            <Eyebrow tone="violet">Next steps</Eyebrow>
          </p>
          <h2 id="home-next-title" className="type-h2 text-navy">
            Ready to narrow it <em className="text-gradient-brand pr-1 italic">down?</em>
          </h2>
        </div>

        <ul className="reveal-stagger grid gap-4 md:grid-cols-3">
          {STEPS.map(({ title, body, href, icon: Icon }, index) => {
            const a = STEP_TONES[index % STEP_TONES.length];
            return (
            <li key={href}>
              <Tilt max={7}>
                <Link
                  href={href}
                  className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-white/80 bg-surface/90 p-5 shadow-raised backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:shadow-overlay sm:p-6"
                >
                  <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", a.solid)} />
                  <span className={cn("flex size-10 items-center justify-center rounded-md transition-colors duration-300", a.tint, a.groupHoverSolid)}>
                    <Icon aria-hidden="true" className={cn("size-5 transition-colors duration-300 group-hover:text-white", a.ink)} strokeWidth={1.75} />
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
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
