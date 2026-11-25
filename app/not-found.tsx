import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "@/components/layout/SearchBox";
import { Container } from "@/components/ui/Container";

// Next.js adds `noindex` to not-found responses itself.
export const metadata: Metadata = {
  title: "Page not found",
};

const destinations = [
  { label: "Browse all software", href: "/software" },
  { label: "Explore categories", href: "/categories" },
  { label: "Compare products", href: "/compare" },
  { label: "Read buying guides", href: "/software-buying-guides" },
];

export default function NotFound() {
  return (
    <Container width="narrow" className="py-16 sm:py-24">
      <p className="type-label">Error 404</p>
      <h1 className="type-h1 mt-3 text-navy">We couldn&rsquo;t find that page</h1>
      <p className="type-body mt-4 text-subtle">
        The link may be out of date, or the page may have moved. Search the
        directory or start from one of the sections below.
      </p>

      <SearchBox variant="inline" label="Search the directory" className="mt-8" />

      <ul className="mt-10 grid gap-x-6 gap-y-3 border-t border-line pt-6 sm:grid-cols-2">
        {destinations.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="rounded-xs text-sm font-medium text-blue-ink underline decoration-blue/30 underline-offset-4 hover:decoration-blue"
            >
              {d.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/"
            className="rounded-xs text-sm font-medium text-blue-ink underline decoration-blue/30 underline-offset-4 hover:decoration-blue"
          >
            Go to the homepage
          </Link>
        </li>
      </ul>
    </Container>
  );
}
