import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { DemoDataNotice } from "@/components/ui/DemoDataNotice";
import type { DirectoryData } from "@/lib/directory/data";
import type { DirectoryPreset } from "@/lib/directory/preset";
import { cn } from "@/lib/utils";
import { DirectoryClient } from "./DirectoryClient";
import { DirectoryView } from "./DirectoryView";

export const directoryRoutes = [
  { href: "/software", label: "All software" },
  { href: "/software/trending", label: "Editor's picks" },
  { href: "/software/new", label: "Recently added" },
  { href: "/software/free", label: "Free plans" },
  { href: "/software/top-rated", label: "Top rated" },
] as const;

export type DirectoryRoute = (typeof directoryRoutes)[number]["href"];

/** Links between the directory views; the current one is marked. */
export function DirectoryNav({ current }: { current: DirectoryRoute }) {
  return (
    <nav aria-label="Directory views" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">
        {directoryRoutes.map((route) => {
          const active = route.href === current;
          return (
            <li key={route.href}>
              <Link
                href={route.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-md border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-navy bg-navy text-white"
                    : "border-line-strong bg-surface text-ink hover:bg-surface-alt",
                )}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Page header shared by the directory routes: breadcrumbs, eyebrow, H1, intro and view links. */
export function DirectoryHeader({
  crumbs,
  eyebrow,
  title,
  intro,
  current,
}: {
  crumbs: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  intro: ReactNode;
  current: DirectoryRoute;
}) {
  return (
    <header className="border-b border-line bg-surface-alt">
      <Container className="py-8 sm:py-10">
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="type-label mt-6">{eyebrow}</p>}
        <h1 className={cn("type-h1 max-w-3xl text-navy", eyebrow ? "mt-2" : "mt-6")}>{title}</h1>
        <div className="type-body mt-3 max-w-2xl text-subtle">{intro}</div>
        <div className="mt-6">
          <DirectoryNav current={current} />
        </div>
      </Container>
    </header>
  );
}

/**
 * The listing on its own (filters, results, pagination). The listing is a
 * client component inside `<Suspense>`: the prerendered HTML holds the
 * unfiltered first page (the fallback), and the browser re-renders it for the
 * URL's query params.
 */
export function DirectoryListing({ data, preset }: { data: DirectoryData; preset: DirectoryPreset }) {
  return (
    <Suspense fallback={<DirectoryView data={data} preset={preset} params={{}} />}>
      <DirectoryClient data={data} preset={preset} />
    </Suspense>
  );
}

/** Static server shell for a directory route: a header, the demo-data notice and the listing. */
export function DirectoryPage({
  data,
  preset,
  header,
}: {
  data: DirectoryData;
  preset: DirectoryPreset;
  header: ReactNode;
}) {
  return (
    <>
      {header}
      <Container className="py-8 sm:py-10">
        <DemoDataNotice className="mb-8" />
        <DirectoryListing data={data} preset={preset} />
      </Container>
    </>
  );
}
