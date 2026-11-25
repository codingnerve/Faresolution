"use client"; // Error boundaries must be Client Components.

import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <Container width="narrow" className="py-16 sm:py-24">
      <p className="type-label">Something went wrong</p>
      <h1 className="type-h1 mt-3 text-navy">This page didn&rsquo;t load</h1>
      <p className="type-body mt-4 text-subtle">
        An unexpected error stopped this page from rendering. Trying again
        usually fixes it; if not, head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button onClick={() => retry()}>
          <RefreshCw aria-hidden="true" strokeWidth={2} />
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Go to the homepage
        </Button>
      </div>
      {digest && <p className="type-meta mt-8">Reference: {digest}</p>}
    </Container>
  );
}
