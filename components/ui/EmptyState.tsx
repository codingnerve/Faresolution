import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-surface-alt px-6 py-12 text-center sm:py-16",
        className,
      )}
    >
      <span className="mb-5 inline-flex size-10 items-center justify-center rounded-md border border-line bg-surface text-subtle shadow-card">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="type-h3 text-navy">{title}</h3>
      <p className="type-body mt-2 max-w-md text-subtle">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
