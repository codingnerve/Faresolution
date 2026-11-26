import Image from "next/image";
import type { Author, ImageAsset } from "@/lib/data/types";
import { ARTICLE_PAGE_IDS } from "@/lib/editorial";
import { cn, getInitials } from "@/lib/utils";

/** Abstract editorial avatar when provided, or monogram fallback (never author photos). */
export function AuthorMonogram({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar?: ImageAsset;
  size?: "sm" | "md";
}) {
  if (avatar) {
    const px = size === "sm" ? 36 : 48;
    return (
      <Image
        src={avatar.src}
        alt={avatar.alt}
        width={256}
        height={256}
        sizes={`${px}px`}
        className={cn(
          "shrink-0 rounded-md border border-line object-cover",
          size === "sm" ? "size-9" : "size-12",
        )}
      />
    );
  }
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
    <section aria-labelledby={ARTICLE_PAGE_IDS.author} className={cn("rounded-lg border border-line bg-surface-alt p-6", className)}>
      <p className="type-label">About the author</p>
      <div className="mt-4 flex gap-4">
        <AuthorMonogram name={author.name} avatar={author.avatar} />
        <div className="min-w-0">
          <h2 id={ARTICLE_PAGE_IDS.author} className="text-[1.0625rem] leading-6 font-semibold text-navy">
            {author.name}
          </h2>
          <p className="type-meta">{author.role}</p>
          <p className="type-body mt-3 text-[0.9375rem] leading-[1.65] text-ink">{author.bio}</p>
        </div>
      </div>
    </section>
  );
}
