import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { getCategoryTree, getIndustries } from "@/lib/data";
import { DesktopNav } from "./DesktopNav";
import { HeaderSearch } from "./HeaderSearch";
import { MobileNav } from "./MobileNav";
import { buildNavModel, vendorsLink } from "./navigation";

/**
 * Sticky site header. The header element is the positioning context for the
 * full-width mega menu and search panel, so nothing between it and those
 * panels may be positioned. No account links: sign-in is not part of this build.
 */
export async function Header() {
  const [tree, industries] = await Promise.all([getCategoryTree(), getIndustries()]);
  const nav = buildNavModel(tree, industries);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-navy px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center gap-4 lg:gap-6">
        <Link href="/" aria-label="Faresolution home" className="shrink-0 rounded-sm">
          <Logo />
        </Link>
        <DesktopNav nav={nav} className="hidden lg:block" />
        <div className="ml-auto flex items-center gap-1">
          <HeaderSearch />
          <Link
            href={vendorsLink.href}
            className="ml-2 hidden h-9 items-center rounded-md border border-line-strong px-3.5 text-sm font-medium text-ink shadow-card transition-colors hover:border-muted/60 hover:bg-surface-alt lg:inline-flex"
          >
            {vendorsLink.label}
          </Link>
          <MobileNav nav={nav} className="lg:hidden" />
        </div>
      </Container>
    </header>
  );
}
