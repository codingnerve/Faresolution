import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  image?: ImageAsset;
  /**
   * Level of the title heading (looks the same either way). Use 2 when the
   * empty state follows the page's h1 directly, so no level is skipped.
   */
  headingLevel?: 2 | 3;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  image,
  headingLevel = 3,
  className,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-surface-alt px-6 py-12 text-center sm:py-16",
        className,
      )}
    >
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={600}
          height={450}
          sizes="(min-width: 640px) 240px, 200px"
          className="mb-6 h-auto w-50 rounded-md border border-line bg-surface object-cover shadow-card sm:w-60"
        />
      ) : (
        <span className="mb-5 inline-flex size-10 items-center justify-center rounded-md border border-line bg-surface text-subtle shadow-card">
          <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </span>
      )}
      <Heading className="type-h3 text-navy">{title}</Heading>
      <p className="type-body mt-2 max-w-md text-subtle">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
