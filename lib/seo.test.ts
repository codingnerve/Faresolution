import { describe, expect, it } from "vitest";
import {
  MAX_PAGE_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  TITLE_SUFFIX,
  brandedTitle,
  buildMetadata,
  canonical,
  siteUrl,
} from "./seo";

describe("siteUrl", () => {
  it("drops trailing slashes except on the root", () => {
    expect(siteUrl("/products/x/")).toBe("https://faresolution.com/products/x");
    expect(siteUrl("/products/x///")).toBe("https://faresolution.com/products/x");
    expect(siteUrl("/")).toBe("https://faresolution.com/");
    expect(siteUrl("")).toBe("https://faresolution.com/");
  });

  it("collapses repeated slashes and adds a missing leading slash", () => {
    expect(siteUrl("//a")).toBe("https://faresolution.com/a");
    expect(siteUrl("/a//b")).toBe("https://faresolution.com/a/b");
    expect(siteUrl("about")).toBe("https://faresolution.com/about");
  });

  it("keeps a query string and fragment as given, normalising only the path", () => {
    expect(siteUrl("/software/?q=crm")).toBe("https://faresolution.com/software?q=crm");
    expect(siteUrl("/reviews#draft-title")).toBe("https://faresolution.com/reviews#draft-title");
  });
});

describe("canonical", () => {
  it("drops page, sort, view, search and filter parameters", () => {
    expect(canonical("/software", { page: "3", sort: "name" })).toBe("https://faresolution.com/software");
    expect(canonical("/software", { view: "list", category: "crm-software", q: "crm", feature: undefined })).toBe(
      "https://faresolution.com/software",
    );
    expect(canonical("/categories/crm-software/")).toBe("https://faresolution.com/categories/crm-software");
  });

  it("ignores any query already in the path", () => {
    expect(canonical("/software?page=2&sort=name")).toBe("https://faresolution.com/software");
  });
});

describe("brandedTitle", () => {
  it("appends the site name the way the root title template does", () => {
    expect(brandedTitle("About")).toBe("About | Faresolution");
    expect(TITLE_SUFFIX).toBe(" | Faresolution");
    expect(MAX_PAGE_TITLE_LENGTH).toBe(MAX_TITLE_LENGTH - TITLE_SUFFIX.length);
  });
});

describe("buildMetadata", () => {
  const base = { title: "About", description: "Who we are.", path: "/about/" };

  it("sets the title (for the template), description and absolute canonical", () => {
    const m = buildMetadata(base);
    expect(m.title).toBe("About");
    expect(m.description).toBe("Who we are.");
    expect(m.alternates).toEqual({ canonical: "https://faresolution.com/about" });
    expect(m.robots).toBeUndefined();
  });

  it("always gives Open Graph the site name, url, type, locale and the full branded title", () => {
    const m = buildMetadata(base);
    expect(m.openGraph).toEqual({
      type: "website",
      siteName: "Faresolution",
      locale: "en_US",
      url: "https://faresolution.com/about",
      title: "About | Faresolution",
      description: "Who we are.",
    });
    expect(m.twitter).toEqual({ card: "summary", title: "About | Faresolution", description: "Who we are." });
  });

  it("uses an explicit Open Graph title when given", () => {
    const m = buildMetadata({ ...base, ogTitle: "About Faresolution" });
    expect(m.openGraph?.title).toBe("About Faresolution");
    expect(m.twitter?.title).toBe("About Faresolution");
    expect(m.title).toBe("About");
  });

  it("passes an absolute title through untemplated and uses it as the Open Graph title", () => {
    const m = buildMetadata({ ...base, title: { absolute: "Faresolution: Find. Compare. Choose Better." }, path: "/" });
    expect(m.title).toEqual({ absolute: "Faresolution: Find. Compare. Choose Better." });
    expect(m.openGraph?.title).toBe("Faresolution: Find. Compare. Choose Better.");
    expect(m.alternates?.canonical).toBe("https://faresolution.com/");
  });

  it("marks noindex pages index: false, follow: true unless told not to follow", () => {
    expect(buildMetadata({ ...base, noindex: true }).robots).toEqual({ index: false, follow: true });
    expect(buildMetadata({ ...base, noindex: true, nofollow: true }).robots).toEqual({ index: false, follow: false });
  });

  it("adds article facts and authors for articles", () => {
    const m = buildMetadata({
      ...base,
      type: "article",
      article: {
        publishedTime: "2026-01-02",
        modifiedTime: "2026-02-03",
        section: "Buying",
        authors: ["Ada Lovelace"],
      },
    });
    expect(m.openGraph).toMatchObject({
      type: "article",
      siteName: "Faresolution",
      publishedTime: "2026-01-02",
      modifiedTime: "2026-02-03",
      section: "Buying",
      authors: ["Ada Lovelace"],
    });
    expect(m.authors).toEqual([{ name: "Ada Lovelace" }]);
  });

  it("switches to a large Twitter card only when images are given", () => {
    const m = buildMetadata({ ...base, images: [{ url: "https://faresolution.com/og.png", alt: "Faresolution" }] });
    expect(m.openGraph?.images).toEqual([{ url: "https://faresolution.com/og.png", alt: "Faresolution" }]);
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: [{ url: "https://faresolution.com/og.png", alt: "Faresolution" }] });
  });
});
