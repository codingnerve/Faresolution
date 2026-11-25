import type { Metadata } from "next";
import { ArrowRight, Search, SearchX, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import {
  Badge,
  Breadcrumbs,
  Button,
  Container,
  DemoDataNotice,
  EmptyState,
  Logo,
  LogoMark,
  Rating,
  SectionHeader,
  Tabs,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Design system",
  description: "Internal reference for Faresolution tokens and UI components.",
  robots: { index: false, follow: false },
};

const palette = [
  { token: "navy", hex: "#17243A", use: "Headlines, primary actions, brand tile" },
  { token: "blue", hex: "#4169E1", use: "Accent, focus, links on large text" },
  { token: "violet", hex: "#7767D8", use: "Secondary accent, sparingly" },
  { token: "surface", hex: "#FFFFFF", use: "Page background" },
  { token: "surface-alt", hex: "#F6F7FA", use: "Bands, wells, empty states" },
  { token: "ink", hex: "#202A39", use: "Body text" },
  { token: "muted", hex: "#737D8C", use: "Icons, rules, large secondary text" },
  { token: "line", hex: "#E7EAF0", use: "Hairlines and borders" },
];

const support = [
  { token: "subtle", hex: "#5F6978", use: "Small secondary text (AA)" },
  { token: "line-strong", hex: "#D5DAE3", use: "Control borders, hover" },
  { token: "navy-soft", hex: "#22324D", use: "Primary hover" },
  { token: "blue-ink", hex: "#2B4CB3", use: "Blue text on tint, links" },
  { token: "blue-tint", hex: "#EEF2FD", use: "Blue badge, selection" },
  { token: "violet-ink", hex: "#5545B8", use: "Violet text on tint" },
  { token: "violet-tint", hex: "#F2F0FC", use: "Violet badge" },
  { token: "success", hex: "#1E7A55", use: "Positive state text" },
  { token: "success-tint", hex: "#E8F4EE", use: "Positive state fill" },
  { token: "sponsored", hex: "#85570F", use: "Paid placement disclosure" },
  { token: "sponsored-tint", hex: "#FAF3E6", use: "Sponsored badge fill" },
  { token: "danger", hex: "#B42335", use: "Form errors" },
  { token: "danger-tint", hex: "#FCEDEF", use: "Error fill" },
];

const typeScale = [
  {
    className: "type-display",
    spec: "Newsreader 400 · 40 to 72px · 1.04",
    sample: "Find the software that moves your business forward.",
  },
  {
    className: "type-h1",
    spec: "Newsreader 420 · 32 to 48px · 1.1",
    sample: "Project management software",
  },
  {
    className: "type-h2",
    spec: "Newsreader 440 · 24 to 32px · 1.18",
    sample: "How teams shortlist a new CRM",
  },
  {
    className: "type-h3",
    spec: "Geist 600 · 18px · 1.35",
    sample: "Pricing and plans",
  },
  {
    className: "type-body",
    spec: "Geist 400 · 16px · 1.65",
    sample:
      "Compare features, deployment options and integrations side by side, then save a shortlist to share with your team.",
  },
  {
    className: "type-meta",
    spec: "Geist 400 · 13px · 1.5 · subtle",
    sample: "Updated November 2026 · 12 integrations",
  },
  {
    className: "type-label",
    spec: "Geist 600 · 12px · caps · 0.08em",
    sample: "Editor's guide",
  },
];

const marks = [
  { name: "Northwind Ledger", color: "#2F6F5E" },
  { name: "Atlas Desk", color: "#4169E1" },
  { name: "Cobalt Forms", color: "#7767D8" },
  { name: "Harbor", color: "#F2B544" },
  { name: "Quillstack", color: "#C2410C" },
  { name: "Meridian People", color: "#17243A" },
];

const sections = [
  ["colour", "Colour"],
  ["type", "Typography"],
  ["shape", "Shape and elevation"],
  ["brand", "Logo"],
  ["buttons", "Buttons"],
  ["badges", "Badges"],
  ["rating", "Rating"],
  ["marks", "Logo marks"],
  ["navigation", "Navigation"],
  ["layout", "Layout"],
  ["feedback", "Feedback"],
] as const;

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-8 border-t border-line py-12 sm:py-16"
    >
      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <div>
          <h2 id={`${id}-title`} className="type-h3 text-navy">
            {title}
          </h2>
          {note && <p className="type-meta mt-2 max-w-xs">{note}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function Specimen({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="type-label mb-3">{label}</p>
      {children}
    </div>
  );
}

function Swatch({ token, hex, use }: { token: string; hex: string; use: string }) {
  return (
    <li className="min-w-0 overflow-hidden rounded-md border border-line bg-surface">
      <div className="h-16 border-b border-line" style={{ backgroundColor: hex }} />
      <div className="px-3 py-2.5">
        <p className="truncate font-mono text-[0.8125rem] font-medium text-ink">{token}</p>
        <p className="font-mono text-xs text-subtle">{hex}</p>
        <p className="type-meta mt-1 text-xs">{use}</p>
      </div>
    </li>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="flex-1 pb-24">
      <Container>
        <header className="pt-10 pb-12 sm:pt-14 sm:pb-16">
          <Logo />
          <div className="mt-12 max-w-3xl">
            <p className="type-label">Internal reference</p>
            <h1 className="type-h1 mt-3 text-navy">Design system</h1>
            <p className="type-body mt-4 text-subtle">
              Tokens and components for the Faresolution public site. Light
              theme only, corners at 8px or less, hairlines before shadows,
              Newsreader for editorial headlines and Geist for everything a
              visitor operates. This page is not linked and not indexed.
            </p>
          </div>
          <nav aria-label="On this page" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex h-8 items-center rounded-md border border-line px-3 text-[0.8125rem] text-subtle transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <Section
          id="colour"
          title="Colour"
          note="Brand palette is fixed. Muted is 4.2:1 on white, so small secondary text uses subtle instead."
        >
          <div className="space-y-10">
            <Specimen label="Brand palette">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {palette.map((swatch) => (
                  <Swatch key={swatch.token} {...swatch} />
                ))}
              </ul>
            </Specimen>
            <Specimen label="Support tones">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {support.map((swatch) => (
                  <Swatch key={swatch.token} {...swatch} />
                ))}
              </ul>
            </Specimen>
          </div>
        </Section>

        <Section
          id="type"
          title="Typography"
          note="Utility classes .type-display to .type-label. Headline sizes are fluid between mobile and desktop."
        >
          <ul className="divide-y divide-line border-y border-line">
            {typeScale.map((item) => (
              <li
                key={item.className}
                className="grid gap-3 py-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8"
              >
                <div>
                  <p className="font-mono text-[0.8125rem] font-medium text-ink">
                    .{item.className}
                  </p>
                  <p className="type-meta mt-1 text-xs">{item.spec}</p>
                </div>
                <p
                  className={`${item.className} min-w-0 break-words ${
                    item.className.startsWith("type-meta") ||
                    item.className.startsWith("type-label")
                      ? ""
                      : "text-navy"
                  }`}
                >
                  {item.sample}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Specimen label="Editorial italic">
              <p className="font-serif text-2xl text-navy italic">
                Choose better, not just faster.
              </p>
            </Specimen>
            <Specimen label="Mono">
              <p className="font-mono text-sm text-ink">faresolution.com/compare</p>
            </Specimen>
          </div>
        </Section>

        <Section
          id="shape"
          title="Shape and elevation"
          note="Radius tokens cap at 8px; rounded-xl and above resolve to 8px. Shadows are navy-tinted and quiet."
        >
          <div className="space-y-10">
            <Specimen label="Radius">
              <div className="flex flex-wrap gap-4">
                {[
                  ["rounded-xs", "2px"],
                  ["rounded-sm", "4px"],
                  ["rounded-md", "6px"],
                  ["rounded-lg", "8px"],
                ].map(([className, value]) => (
                  <div key={className} className="text-center">
                    <div
                      className={`size-16 border border-line-strong bg-surface-alt ${className}`}
                    />
                    <p className="mt-2 font-mono text-xs text-ink">{className}</p>
                    <p className="type-meta text-xs">{value}</p>
                  </div>
                ))}
              </div>
            </Specimen>
            <Specimen label="Elevation">
              <div className="grid gap-4 rounded-lg bg-surface-alt p-4 sm:grid-cols-3 sm:p-6">
                {[
                  ["shadow-card", "Cards and controls at rest"],
                  ["shadow-raised", "Hovered cards, sticky bars"],
                  ["shadow-overlay", "Menus, popovers, dialogs"],
                ].map(([className, use]) => (
                  <div
                    key={className}
                    className={`rounded-lg border border-line bg-surface p-4 ${className}`}
                  >
                    <p className="font-mono text-[0.8125rem] font-medium text-ink">{className}</p>
                    <p className="type-meta mt-1">{use}</p>
                  </div>
                ))}
              </div>
            </Specimen>
          </div>
        </Section>

        <Section
          id="brand"
          title="Logo"
          note="A ranked shortlist in a navy tile, reading as an abstract F. Works in a single colour by knocking the bars out."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex h-36 items-center justify-center rounded-lg border border-line bg-surface">
              <Logo size="lg" />
            </div>
            <div className="flex h-36 items-center justify-center rounded-lg bg-navy text-white">
              <Logo size="lg" tone="mono" />
            </div>
            <div className="flex h-28 items-center justify-center rounded-lg border border-line bg-surface-alt text-ink">
              <Logo tone="mono" />
            </div>
            <div className="flex h-28 items-center justify-center gap-6 rounded-lg border border-line bg-surface">
              <Logo markOnly size="lg" />
              <Logo markOnly />
              <Logo markOnly size="sm" />
            </div>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          note="Button renders a Link when given href, otherwise a button. Primary once per view."
        >
          <div className="space-y-8">
            {(["primary", "secondary", "ghost"] as const).map((variant) => (
              <Specimen key={variant} label={variant}>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant={variant} size="sm">
                    Small
                  </Button>
                  <Button variant={variant}>Medium</Button>
                  <Button variant={variant} size="lg">
                    Large
                  </Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                </div>
              </Specimen>
            ))}
            <Specimen label="link">
              <div className="flex flex-wrap items-center gap-6">
                <Button variant="link" href="#buttons">
                  View all categories
                </Button>
                <Button variant="link" size="sm" href="#buttons">
                  See pricing details
                </Button>
              </div>
            </Specimen>
            <Specimen label="With icons, as links">
              <div className="flex flex-wrap items-center gap-3">
                <Button href="#buttons" size="lg">
                  <Search aria-hidden="true" />
                  Browse software
                </Button>
                <Button href="#buttons" variant="secondary" size="lg">
                  Compare products
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </Specimen>
          </div>
        </Section>

        <Section id="badges" title="Badges" note="Short labels. Sponsored always discloses paid placement.">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Free plan</Badge>
            <Badge tone="blue">Cloud</Badge>
            <Badge tone="violet">New</Badge>
            <Badge tone="success">
              <ShieldCheck aria-hidden="true" />
              Verified listing
            </Badge>
            <Badge tone="sponsored">Sponsored</Badge>
          </div>
        </Section>

        <Section
          id="rating"
          title="Rating"
          note="No value means no stars: the component reads 'No reviews yet'. Filled previews use sample input only."
        >
          <div className="grid gap-6 sm:grid-cols-3">
            <Specimen label="value: null">
              <Rating value={null} count={0} />
            </Specimen>
            <Specimen label="Sample input, sm">
              <Rating value={4.3} count={128} />
            </Specimen>
            <Specimen label="Sample input, md">
              <Rating value={3.6} count={1} size="md" />
            </Specimen>
          </div>
        </Section>

        <Section
          id="marks"
          title="Logo marks"
          note="Generated from product name and brand colour. Light colours switch to navy initials automatically."
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {marks.map((mark) => (
              <li
                key={mark.name}
                className="flex min-w-0 items-center gap-3 rounded-md border border-line p-3"
              >
                <LogoMark name={mark.name} color={mark.color} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{mark.name}</p>
                  <p className="font-mono text-xs text-subtle">{mark.color}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-end gap-4">
            <LogoMark name="Atlas Desk" color="#4169E1" size={24} />
            <LogoMark name="Atlas Desk" color="#4169E1" size={32} />
            <LogoMark name="Atlas Desk" color="#4169E1" size={48} />
            <LogoMark name="Atlas Desk" color="#4169E1" size={64} />
          </div>
        </Section>

        <Section
          id="navigation"
          title="Navigation"
          note="Breadcrumbs also emit BreadcrumbList JSON-LD. Tabs are links, so every tab is a shareable URL."
        >
          <div className="space-y-10">
            <Specimen label="Breadcrumbs">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Design system", href: "/design" },
                  { label: "Navigation" },
                ]}
              />
            </Specimen>
            <Specimen label="Tabs">
              <Tabs
                label="Product sections"
                items={[
                  "Overview",
                  "Reviews",
                  "Features",
                  "Pricing",
                  "Alternatives",
                  "Integrations",
                  "Screenshots",
                  "FAQ",
                ].map((label, index) => ({
                  label,
                  href: "#navigation",
                  active: index === 0,
                }))}
              />
            </Specimen>
          </div>
        </Section>

        <Section
          id="layout"
          title="Layout"
          note="Container sets page gutters (16/24/32px) and widths. SectionHeader opens content bands."
        >
          <div className="space-y-10">
            <Specimen label="SectionHeader">
              <div className="rounded-lg border border-line p-5 sm:p-8">
                <SectionHeader
                  eyebrow="Categories"
                  title="Start with what your team needs"
                  description="Browse by function, then narrow by company size, deployment and integrations."
                  action={
                    <Button href="#layout" variant="secondary">
                      All categories
                    </Button>
                  }
                />
              </div>
            </Specimen>
            <Specimen label="Container widths">
              <div className="space-y-2">
                {[
                  ["narrow", "42rem", "max-w-reading"],
                  ["default", "76rem", "max-w-page"],
                ].map(([name, size, className]) => (
                  <div
                    key={name}
                    className={`${className} rounded-sm border border-dashed border-line-strong bg-surface-alt px-3 py-2 font-mono text-xs text-subtle`}
                  >
                    {name} · {size}
                  </div>
                ))}
              </div>
            </Specimen>
          </div>
        </Section>

        <Section
          id="feedback"
          title="Feedback"
          note="Shown where results are empty and wherever sample data appears."
        >
          <div className="space-y-8">
            <Specimen label="DemoDataNotice">
              <DemoDataNotice />
            </Specimen>
            <Specimen label="EmptyState">
              <EmptyState
                icon={SearchX}
                title="No products match these filters"
                description="Try removing a filter or searching for a broader term, such as a category name."
                action={
                  <Button href="#feedback" variant="secondary" size="sm">
                    Clear filters
                  </Button>
                }
              />
            </Specimen>
          </div>
        </Section>
      </Container>
    </main>
  );
}
