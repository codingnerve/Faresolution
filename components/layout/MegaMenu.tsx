import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { allCategoriesLink, type NavGroup, type NavLink } from "./navigation";

const panelLink =
  "rounded-sm text-sm text-subtle transition-colors hover:text-navy hover:underline hover:decoration-line-strong hover:underline-offset-4";

/** Categories mega menu: parent categories with their children, plus a browse rail. */
export function MegaMenu({ groups }: { groups: NavGroup[] }) {
  const total = groups.reduce((n, g) => n + 1 + g.links.length, 0);
  return (
    <Container className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="columns-3 gap-8 xl:columns-4">
        {groups.map((group) => (
          <div key={group.href} className="mb-6 break-inside-avoid">
            <Link
              href={group.href}
              className="rounded-sm text-sm font-semibold text-navy hover:text-blue-ink"
            >
              {group.label}
            </Link>
            {group.links.length > 0 && (
              <ul className="mt-2 space-y-1.5 border-l border-line pl-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={panelLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <aside className="self-start rounded-lg border border-line bg-surface-alt p-5">
        <p className="type-label">Browse the directory</p>
        <p className="mt-2 text-sm leading-6 text-subtle">
          {total} categories, each with a buying guide and the products we list in it.
        </p>
        <Link
          href={allCategoriesLink.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-blue-ink hover:text-navy"
        >
          {allCategoriesLink.label}
          <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
        </Link>
        <ul className="mt-4 space-y-2 border-t border-line pt-4">
          <li>
            <Link href="/software" className={panelLink}>
              All software
            </Link>
          </li>
          <li>
            <Link href="/software/new" className={panelLink}>
              Recently added
            </Link>
          </li>
          <li>
            <Link href="/software/free" className={panelLink}>
              Free software
            </Link>
          </li>
        </ul>
      </aside>
    </Container>
  );
}

/** Compact dropdown list (Industries, Resources) with a trailing "all" link. */
export function MenuList({
  links,
  footer,
  columns = 1,
}: {
  links: NavLink[];
  footer?: NavLink;
  columns?: 1 | 2;
}) {
  return (
    <div className="p-2">
      {/* CSS columns keep DOM order top-to-bottom, matching Up/Down arrow movement. */}
      <ul className={cn("space-y-0.5", columns === 2 && "columns-2 gap-1 [&>li]:break-inside-avoid")}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-md px-3 py-2 transition-colors hover:bg-surface-alt"
            >
              <span className="block text-sm font-medium text-ink">{link.label}</span>
              {link.description && (
                <span className="mt-0.5 block text-[0.8125rem] leading-5 text-subtle">
                  {link.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {footer && (
        <div className="mt-1 border-t border-line px-3 pt-2.5 pb-1.5">
          <Link
            href={footer.href}
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-blue-ink hover:text-navy"
          >
            {footer.label}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}
