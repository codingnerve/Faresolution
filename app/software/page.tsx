import type { Metadata } from "next";
import { DirectoryHeader, DirectoryPage } from "@/components/directory/DirectoryPage";
import { getDirectoryData } from "@/lib/directory/data";

const title = "Business software directory";
const description =
  "Browse business software by category, pricing model, company size, deployment, industry, features and integrations. Filter, sort and shortlist in one place.";

// Metadata is static: filters and pages live in client-side query params, so
// every variant shares the unparametrised canonical (see DirectoryView for
// the noindex on pages beyond the first).
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/software" },
  openGraph: { url: "/software", title, description },
};

export default async function SoftwarePage() {
  const data = await getDirectoryData();
  return (
    <DirectoryPage
      data={data}
      preset={{ basePath: "/software" }}
      header={
        <DirectoryHeader
          current="/software"
          crumbs={[{ label: "Home", href: "/" }, { label: "Software" }]}
          title="All business software"
          intro={
            <p>
              {data.products.length} products across every category in the directory. Narrow the
              list by what your team needs, then open a profile to see plans, features and
              integrations.
            </p>
          }
        />
      }
    />
  );
}
