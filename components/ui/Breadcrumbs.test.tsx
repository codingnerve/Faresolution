import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

describe("Breadcrumbs", () => {
  it("emits BreadcrumbList JSON-LD with `<` escaped", () => {
    const html = renderToStaticMarkup(
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "</script><b>x" }]} />,
    );
    const json = /<script type="application\/ld\+json">(.*?)<\/script>/.exec(html)?.[1] ?? "";
    expect(json).not.toContain("<");
    const data = JSON.parse(json);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement[0]).toMatchObject({ name: "Home", item: "https://faresolution.org/" });
    expect(data.itemListElement[1].name).toBe("</script><b>x");
  });
});
