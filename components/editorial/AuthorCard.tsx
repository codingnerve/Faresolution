import type { Author } from "@/lib/data/types";
import { cn, getInitials } from "@/lib/utils";

/** Monogram for an author: there are no author photos. */
export function AuthorMonogram({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-navy font-serif text-white",
        size === "sm" ? "size-9 text-[0.9375rem]" : "size-12 text-lg",
      )}
    >
      {getInitials(name)}
    </span>
  );
}

/** Name, role and bio exactly as recorded; no credentials are added. */
export function AuthorCard({ author, className }: { author: Author; className?: string }) {
  return (
    <section aria-labelledby="article-author-title" className={cn("rounded-lg border border-line bg-surface-alt p-6", className)}>
      <p className="type-label">About the author</p>
      <div className="mt-4 flex gap-4">
        <AuthorMonogram name={author.name} />
        <div className="min-w-0">
          <h2 id="article-author-title" className="text-[1.0625rem] leading-6 font-semibold text-navy">
            {author.name}
          </h2>
          <p className="type-meta">{author.role}</p>
          <p className="type-body mt-3 text-[0.9375rem] leading-[1.65] text-ink">{author.bio}</p>
        </div>
      </div>
    </section>
  );
}
