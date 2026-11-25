import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabItem = { label: string; href: string; active: boolean };

type TabsProps = {
  items: TabItem[];
  /** Accessible name for the tab navigation. */
  label?: string;
  className?: string;
};

/**
 * Link-based tabs: each tab is a real URL. Scrolls horizontally inside its
 * own track on narrow screens rather than widening the page.
 */
export function Tabs({ items, label = "Sections", className }: TabsProps) {
  return (
    <nav aria-label={label} className={cn("relative border-b border-line", className)}>
      <ul className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <li key={`${item.label}-${item.href}`} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center border-b-2 text-sm focus-visible:outline-offset-[-2px] font-medium whitespace-nowrap transition-colors",
                item.active
                  ? "border-navy text-navy"
                  : "border-transparent text-subtle hover:border-line-strong hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
