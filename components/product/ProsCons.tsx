import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Editorial strengths and limitations side by side (stacked on small screens). */
export function ProsCons({ pros, cons, className }: { pros: string[]; cons: string[]; className?: string }) {
  const columns = [
    { title: "Strengths", items: pros, Icon: Plus, tone: "text-success bg-success-tint border-success/15" },
    { title: "Limitations", items: cons, Icon: Minus, tone: "text-danger bg-danger-tint border-danger/15" },
  ].filter((c) => c.items.length > 0);
  if (columns.length === 0) return null;

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {columns.map(({ title, items, Icon, tone }) => (
        <div key={title} className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          <h3 className="text-[0.9375rem] font-semibold text-navy">{title}</h3>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] leading-6 text-ink">
                <span
                  aria-hidden="true"
                  className={cn("mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-sm border", tone)}
                >
                  <Icon className="size-3.5" strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
