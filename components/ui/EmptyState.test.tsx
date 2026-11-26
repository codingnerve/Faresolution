import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders the title as an h3 by default", () => {
    const html = renderToStaticMarkup(<EmptyState title="Nothing here" description="Yet." />);
    expect(html).toMatch(/<h3 class="type-h3 text-navy">Nothing here<\/h3>/);
    expect(html).not.toContain("<h2");
  });

  it("renders an h2 with the same look when headingLevel is 2", () => {
    const html = renderToStaticMarkup(<EmptyState title="Nothing here" description="Yet." headingLevel={2} />);
    expect(html).toMatch(/<h2 class="type-h3 text-navy">Nothing here<\/h2>/);
    expect(html).not.toContain("<h3");
  });
});
