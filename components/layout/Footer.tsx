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
import { COPYRIGHT_YEAR, SITE_TAGLINE, socialLinks } from "@/lib/site";
import { SITE_NAME } from "@/lib/utils";
import {
  allCategoriesLink,
  allIndustriesLink,
  allResourcesLink,
  categoryHref,
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
  { label: "Trending", href: "/software/trending" },
  { label: "Recently added", href: "/software/new" },
  { label: "Free software", href: "/software/free" },
  { label: "Top rated", href: "/software/top-rated" },
  { label: "All categories", href: allCategoriesLink.href },
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
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
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
      href: `/compare/${c.slugs.join("-vs-")}`,
    }));

  const alternativeLinks: NavLink[] = FEATURED_ALTERNATIVES.filter((s) => productName.has(s))
    .slice(0, 5)
    .map((slug) => ({ label: `${productName.get(slug)} alternatives`, href: `/alternatives/${slug}` }));

  return [
    { title: "Explore Software", links: exploreLinks },
    {
      title: "Popular Categories",
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
          <p>
            &copy; {COPYRIGHT_YEAR} {SITE_NAME}. All rights reserved.
          </p>
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
