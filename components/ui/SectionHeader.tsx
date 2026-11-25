import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional link or button aligned to the end on wider screens. */
  action?: ReactNode;
  /** Heading level for the title; defaults to h2. */
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
};

const titleStyles = { h1: "type-h1", h2: "type-h2", h3: "type-h3" } as const;

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  className,
  id,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10",
        className,
      )}
    >
      <div className="max-w-2xl min-w-0">
        {eyebrow && <p className="type-label mb-3">{eyebrow}</p>}
        <Heading id={id} className={cn(titleStyles[Heading], "text-navy")}>
          {title}
        </Heading>
        {description && (
          <p className="type-body mt-3 text-subtle">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
