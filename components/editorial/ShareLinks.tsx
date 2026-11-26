import { ArrowUpRight } from "lucide-react";
import { ShareButton } from "@/components/compare/ShareButton";
import { buttonClasses } from "@/components/ui/Button";
import { shareLinks } from "@/lib/editorial";
import { cn } from "@/lib/utils";

/**
 * Share on X or LinkedIn (their public share URLs, opened in a new tab) and
 * copy the link. Every URL is built from the article's canonical absolute
 * URL; copying falls back to a selectable field when the clipboard is unavailable.
 */
export function ShareLinks({ url, title, className }: { url: string; title: string; className?: string }) {
  const links = shareLinks(url, title);
  const external = [
    { label: "Share on X", href: links.x },
    { label: "Share on LinkedIn", href: links.linkedin },
  ];
  return (
    <section aria-labelledby="article-share-title" className={cn("min-w-0", className)}>
      <h2 id="article-share-title" className="type-label">
        Share this article
      </h2>
      <div className="mt-3 flex flex-wrap items-start gap-2.5">
        {external.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "secondary" })}
          >
            {link.label}
            <ArrowUpRight aria-hidden="true" strokeWidth={2} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ))}
        <ShareButton url={url} label="Copy link" />
      </div>
    </section>
  );
}
