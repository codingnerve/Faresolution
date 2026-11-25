import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ProfileSectionProps = {
  id: string;
  title: ReactNode;
  /** Short line under the title. */
  description?: ReactNode;
  /** Optional "see all" link to the full tab. */
  more?: { href: string; label: string };
  children: ReactNode;
  className?: string;
};

/** A titled block of a product profile tab (an H2 under the product H1). */
export function ProfileSection({ id, title, description, more, children, className }: ProfileSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={cn("scroll-mt-32", className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 id={titleId} className="type-h2 text-navy">
            {title}
          </h2>
          {description && <p className="type-body mt-2 max-w-2xl text-subtle">{description}</p>}
        </div>
        {more && (
          <Link
            href={more.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xs text-sm font-medium text-blue-ink hover:text-navy"
          >
            {more.label}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
