import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/**
 * Questions and answers as native disclosure elements: keyboard and screen
 * reader support come with `<details>`, and no client JavaScript is needed.
 * Answers stay in the HTML, so they match any FAQPage JSON-LD on the page.
 */
export function Faq({ items, className }: { items: readonly FaqItem[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-xs py-4 text-left text-[1.0625rem] leading-6 font-medium text-navy marker:content-none hover:text-blue-ink [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180"
              strokeWidth={1.75}
            />
          </summary>
          <p className="type-body max-w-2xl pr-9 pb-5 text-ink">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
