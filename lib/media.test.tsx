import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductLogo } from "@/components/ui/ProductLogo";

function walkTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTsFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("ProductLogo", () => {
  it("falls back to LogoMark when no official logo is provided", () => {
    const html = renderToStaticMarkup(<ProductLogo name="HubSpot CRM" color="#FF7A59" size={40} />);
    expect(html).toContain("<svg");
    expect(html).not.toContain("<img");
    expect(html).toContain("HC");
  });

  it("renders a contained image inside a bordered white tile when a logo is supplied", () => {
    const html = renderToStaticMarkup(
      <ProductLogo
        name="Example"
        color="#17243A"
        size={40}
        logo={{
          src: "/logos/example.svg",
          width: 64,
          height: 64,
          source: "press-kit",
          retrievedAt: "2026-11-26",
        }}
      />,
    );
    expect(html).toContain("<img");
    expect(html).toContain("example.svg");
    expect(html).toContain("object-contain");
    expect(html).toContain("border-line");
  });
});

describe("image src hygiene", () => {
  it("never points an image src outside /images, /logos, or generated OG routes", () => {
    const roots = ["app", "components", "lib"].map((d) => path.join(process.cwd(), d));
    const files = roots.flatMap(walkTsFiles);
    const literalSrcPattern = /<(?:Image|img)\b[^>]*\bsrc=["']([^"']+)["']/g;
    const dataSrcPattern = /\b(?:src|cover|image|avatar)\s*:\s*\{[^}]*\bsrc:\s*["']([^"']+)["']/g;

    const allowed = (src: string) =>
      src.startsWith("/images/") || src.startsWith("/logos/") || /\/opengraph-image$/.test(src);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      for (const pattern of [literalSrcPattern, dataSrcPattern]) {
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(content)) !== null) {
          const src = match[1];
          expect(allowed(src), `Unexpected image src "${src}" in ${file}`).toBe(true);
          if (src.startsWith("/images/")) {
            const disk = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
            expect(fs.existsSync(disk), `Missing image asset ${disk} referenced in ${file}`).toBe(true);
          }
        }
      }
    }
  });
});
