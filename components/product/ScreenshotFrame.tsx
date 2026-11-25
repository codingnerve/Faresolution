import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Designed placeholder where vendor screenshots will go: an empty application
 * window, never a fake screenshot.
 */
export function ScreenshotFrame({ name, className }: { name: string; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-lg border border-line bg-surface shadow-card", className)}>
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-line bg-surface-alt px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 h-4 w-40 max-w-[50%] rounded-sm bg-line" />
      </div>
      <div className="relative grid min-h-64 place-items-center bg-surface-alt px-6 py-10 sm:aspect-[16/9] sm:py-0">
        {/* Neutral wireframe so the frame reads as an empty app window. */}
        <div aria-hidden="true" className="absolute inset-0 hidden gap-4 p-5 sm:flex">
          <div className="w-1/5 space-y-2.5 rounded-sm border border-line/70 p-3">
            {[70, 55, 80, 60, 45].map((w) => (
              <span key={w} className="block h-2 rounded-xs bg-line" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <span className="block h-3 w-1/3 rounded-xs bg-line" />
            <div className="grid flex-1 grid-cols-3 gap-4">
              <span className="rounded-sm border border-line/70" />
              <span className="rounded-sm border border-line/70" />
              <span className="rounded-sm border border-line/70" />
            </div>
            <span className="block flex-1 rounded-sm border border-line/70" />
          </div>
        </div>
        <div className="relative max-w-sm rounded-md border border-line bg-surface px-6 py-5 text-center shadow-raised">
          <ImageOff aria-hidden="true" className="mx-auto size-5 text-subtle" strokeWidth={1.75} />
          <p className="mt-3 text-[0.9375rem] font-semibold text-navy">Vendor screenshots appear once submitted</p>
          <p className="type-meta mt-1.5">
            We only show screenshots supplied or approved by the vendor, so there are none for {name} yet.
          </p>
        </div>
      </div>
      <figcaption className="sr-only">No screenshots of {name} yet</figcaption>
    </figure>
  );
}
