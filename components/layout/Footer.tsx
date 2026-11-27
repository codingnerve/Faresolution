import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import { Logo } from "@/components/ui/Logo";
import {
  getCategoryTree,
  getIndustries,
  getPopularComparisons,
  getProducts,
} from "@/lib/data";
import { COPYRIGHT_YEAR, OWNER_CONTACT, SITE_TAGLINE, socialLinks } from "@/lib/site";
import { SITE_NAME } from "@/lib/utils";
import {
  allCategoriesLink,
  allIndustriesLink,
  allResourcesLink,
  categoryHref,
  compareHref,
  industryHref,
  resourceLinks,
  type NavLink,
} from "./navigation";

interface FooterGroup {
  title: string;
  links: NavLink[];
}

/** Products whose alternatives pages the footer features, when they exist. */
const FEATURED_ALTERNATIVES = [
  "hubspot-crm",
  "asana",
  "quickbooks-online",
  "zendesk",
  "slack",
  "shopify",
];

const exploreLinks: NavLink[] = [
  { label: "All software", href: "/software" },
  // Editorial ordering, not measured popularity (see Product.trendingRank).
  { label: "Editor's picks", href: "/software/trending" },
  { label: "Recently added", href: "/software/new" },
  { label: "Free software", href: "/software/free" },
  // No "Top rated": nothing is rated until reviews open (R14). The placeholder
  // page stays reachable from the directory view links on /software.
  { label: "Reviews", href: "/reviews" },
  { label: "All categories", href: allCategoriesLink.href },
  { label: "Saved items", href: "/saved" },
];

const vendorLinks: NavLink[] = [
  { label: "For vendors", href: "/vendors" },
  { label: "Register interest", href: "/vendors/register" },
  { label: "Claim a listing", href: "/vendors/claim-listing" },
  { label: "Vendor plans", href: "/vendors/pricing" },
  { label: "Vendor resources", href: "/vendors/resources" },
];

const companyLinks: NavLink[] = [
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Review guidelines", href: "/review-guidelines" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund policy", href: "/refund-policy" },
];

async function buildGroups(): Promise<FooterGroup[]> {
  const [tree, industries, comparisons, products] = await Promise.all([
    getCategoryTree(),
    getIndustries(),
    getPopularComparisons(),
    getProducts(),
  ]);
  const productName = new Map(products.map((p) => [p.slug, p.name]));

  const compareLinks: NavLink[] = comparisons
    .filter((c) => c.slugs.length === 2 && c.slugs.every((s) => productName.has(s)))
    .slice(0, 5)
    .map((c) => ({
      label: c.slugs.map((s) => productName.get(s)).join(" vs "),
      href: compareHref(c.slugs),
    }));

  const alternativeLinks: NavLink[] = FEATURED_ALTERNATIVES.filter((s) => productName.has(s))
    .slice(0, 5)
    .map((slug) => ({ label: `${productName.get(slug)} alternatives`, href: `/alternatives/${slug}` }));

  return [
    { title: "Explore Software", links: exploreLinks },
    {
      title: "Main Categories",
      links: tree.slice(0, 6).map((c) => ({ label: c.name, href: categoryHref(c.slug) })),
    },
    {
      title: "Compare Software",
      links: [...compareLinks, { label: "Build a comparison", href: "/compare" }],
    },
    {
      title: "Alternatives",
      links: [...alternativeLinks, { label: "All alternatives", href: "/alternatives" }],
    },
    {
      title: "Industries",
      links: [
        ...industries.slice(0, 5).map((i) => ({ label: i.name, href: industryHref(i.slug) })),
        allIndustriesLink,
      ],
    },
    { title: "Resources", links: [...resourceLinks, allResourcesLink] },
    { title: "For Vendors", links: vendorLinks },
    { title: "Company", links: companyLinks },
  ];
}

const footerLink =
  "rounded-sm text-sm text-white/70 transition-colors hover:text-white hover:underline hover:decoration-white/40 hover:underline-offset-4";

export async function Footer() {
  const groups = await buildGroups();

  return (
    <footer className="on-dark mt-auto bg-navy text-white">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Link href="/" aria-label={`${SITE_NAME} home`} className="inline-flex rounded-sm text-white">
              <Logo tone="mono" />
            </Link>
            <p className="mt-4 font-serif text-xl leading-snug text-white">{SITE_TAGLINE}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              An independent directory for finding, comparing and shortlisting
              business software.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm" aria-label="Owner contact">
              <li>
                <a href={OWNER_CONTACT.emailHref} className={`${footerLink} inline-flex items-center gap-2`}>
                  <Mail aria-hidden="true" className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                  <span>{OWNER_CONTACT.email}</span>
                </a>
              </li>
              <li>
                <a href={OWNER_CONTACT.phoneHref} className={`${footerLink} inline-flex items-center gap-2`}>
                  <Phone aria-hidden="true" className="size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                  <span>{OWNER_CONTACT.phone}</span>
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <h2 className="text-sm font-semibold text-white">The buyer&rsquo;s brief</h2>
              <p className="mt-1 mb-3 text-sm leading-6 text-white/70">
                New buying guides and category research by email, once the
                newsletter launches.
              </p>
              <NewsletterForm tone="dark" source="footer" />
            </div>
          </div>

          <nav aria-label="Footer">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {groups.map((group) => (
                <div key={group.title}>
                  <h2 className="text-[0.8125rem] font-semibold tracking-[0.02em] text-white">
                    {group.title}
                  </h2>
                  <ul className="mt-3 space-y-2.5">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={footerLink}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>

        <DemoDataNotice tone="dark" className="mt-12" />

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.8125rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>
              &copy; {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.
            </p>
            <p className="text-xs text-white/55">
              Product names and logos are trademarks of their respective owners and are used for identification only.
            </p>
          </div>
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Social profiles">
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a href={social.href} rel="me noopener" target="_blank" className={footerLink}>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
