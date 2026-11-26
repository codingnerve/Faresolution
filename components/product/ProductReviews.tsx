import { MessageSquareText, PenLine, Star } from "lucide-react";
import { reviewWriteHref } from "@/components/layout/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Rating } from "@/components/ui/Rating";
import type { Product } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Rating summary. With no reviews (every product in this build) it says so
 * plainly: no stars, no 0.0, no score breakdown.
 */
export function RatingsSummary({ product, className }: { product: Product; className?: string }) {
  const hasReviews = product.reviewCount > 0 && product.rating !== null;
  return (
    <div className={cn("flex items-start gap-4 rounded-lg border border-line bg-surface-alt p-5 sm:p-6", className)}>
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-subtle">
        <Star aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-[1.0625rem] font-semibold text-navy">
          {hasReviews ? <Rating value={product.rating} count={product.reviewCount} size="md" /> : "No reviews yet"}
        </p>
        {!hasReviews && (
          <p className="type-body mt-1 text-subtle">
            {product.name} has no ratings on Faresolution. An overall score will appear here once verified reviews
            are published; we will not show a score without them.
          </p>
        )}
      </div>
    </div>
  );
}

/** Empty review list with the one action that makes sense now: writing a review. */
export function ReviewsEmptyState({ product, className }: { product: Product; className?: string }) {
  return (
    <EmptyState
      icon={MessageSquareText}
      image={{
        src: "/images/empty/no-reviews.webp",
        alt: "Minimal card illustration showing blank review lines waiting for verified user reviews.",
      }}
      className={className}
      // Not "No reviews yet": the header and the ratings summary already say that.
      title="Be the first to draft a review"
      description={`Review collection has not opened yet. You can draft a review of ${product.name} now; once collection opens, reviews will be checked before they are published here.`}
      action={
        <Button href={reviewWriteHref(product.slug)} variant="secondary">
          <PenLine aria-hidden="true" strokeWidth={1.75} />
          Write a review
        </Button>
      }
    />
  );
}
