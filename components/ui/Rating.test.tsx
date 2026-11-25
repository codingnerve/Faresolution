import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Rating } from "@/components/ui/Rating";

function render(value: number | null, count: number): string {
  return renderToStaticMarkup(<Rating value={value} count={count} />);
}

const STAR = "lucide-star";

describe("Rating", () => {
  it("shows 'No reviews yet' when there is no value", () => {
    const html = render(null, 0);
    expect(html).toContain("No reviews yet");
    expect(html).not.toContain(STAR);
  });

  it("does not show a rating without reviews behind it", () => {
    const html = render(4.5, 0);
    expect(html).toContain("No reviews yet");
    expect(html).not.toContain(STAR);
    expect(html).not.toContain("4.5");
  });

  it("never renders a 0.0 rating", () => {
    const html = render(0, 3);
    expect(html).toContain("No reviews yet");
    expect(html).not.toContain("0.0");
    expect(html).not.toContain(STAR);
  });

  it("treats non-finite values as no rating", () => {
    const html = render(Number.NaN, 5);
    expect(html).toContain("No reviews yet");
    expect(html).not.toContain("NaN");
  });

  it("shows stars, value and count when backed by reviews", () => {
    const html = render(4.5, 12);
    expect(html).toContain(STAR);
    expect(html).toContain("4.5");
    expect(html).toContain("(12)");
    expect(html).toContain('aria-label="Rated 4.5 out of 5 from 12 reviews"');
    expect(html).not.toContain("No reviews yet");
  });
});
