import type { GuideSection } from "@/lib/data";

/** Buying advice as numbered steps: heading column on the left, steps on the right from `lg`. */
export function BuyingGuide({ sections }: { sections: readonly GuideSection[] }) {
  return (
    <ol className="divide-y divide-line border-y border-line">
      {sections.map((section, index) => (
        <li key={section.heading} className="grid gap-x-8 gap-y-2 py-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <h3 className="flex items-baseline gap-3 text-[1.0625rem] leading-6 font-semibold tracking-[-0.01em] text-navy">
            <span aria-hidden="true" className="font-serif text-xl font-normal text-blue-ink tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            {section.heading}
          </h3>
          <p className="type-body text-ink">{section.body}</p>
        </li>
      ))}
    </ol>
  );
}
