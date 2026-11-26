import { Info } from "lucide-react";
import type { Block } from "@/lib/data/types";
import { headingIds } from "@/lib/editorial";
import { cn } from "@/lib/utils";

/**
 * Article content, one semantic element per block: h2/h3 (with the ids the
 * table of contents links to), p, ul, and callouts as a labelled note aside.
 */
export function ArticleBody({ blocks, className }: { blocks: readonly Block[]; className?: string }) {
  const ids = headingIds(blocks);
  return (
    <div className={cn("text-ink", className)}>
      {blocks.map((block, index) => {
        const key = `${index}-${block.type}`;
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={key}
                id={ids[index] ?? undefined}
                className="mt-14 mb-4 font-serif text-[1.625rem] leading-[1.2] font-[460] tracking-[-0.014em] text-balance text-navy first:mt-0 sm:text-[1.875rem]"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={key}
                id={ids[index] ?? undefined}
                className="mt-10 mb-3 text-[1.1875rem] leading-7 font-semibold tracking-[-0.012em] text-navy first:mt-0"
              >
                {block.text}
              </h3>
            );
          case "p":
            return (
              <p key={key} className="mt-5 text-[1.0625rem] leading-[1.8] text-pretty first:mt-0">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul key={key} className="mt-5 space-y-3 first:mt-0">
                {block.items.map((item, i) => (
                  <li key={i} className="flex gap-3.5 text-[1.0625rem] leading-[1.75]">
                    <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-xs bg-blue" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <aside
                key={key}
                role="note"
                aria-label={block.title ?? "Note"}
                className="my-8 flex gap-3.5 rounded-md border border-blue/20 border-l-[3px] border-l-blue bg-blue-tint px-5 py-4 first:mt-0 sm:px-6 sm:py-5"
              >
                <Info aria-hidden="true" className="mt-1 size-[1.125rem] shrink-0 text-blue-ink" strokeWidth={2} />
                <div className="min-w-0">
                  {block.title && <p className="font-semibold text-navy">{block.title}</p>}
                  <p className={cn("text-[0.98rem] leading-7 text-ink", block.title && "mt-1")}>{block.text}</p>
                </div>
              </aside>
            );
        }
      })}
    </div>
  );
}
