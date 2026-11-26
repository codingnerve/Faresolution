import type { Metadata } from "next";
import { DirectoryHeader, DirectoryPage } from "@/components/directory/DirectoryPage";
import { getDirectoryData } from "@/lib/directory/data";
import { buildMetadata } from "@/lib/seo";

const title = "Software with a free plan";
const description =
  "Business software that offers a free plan, filterable by category, company size, deployment, features and integrations.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/software/free" });

export default async function FreeSoftwarePage() {
  const data = await getDirectoryData((p) => p.pricing.freePlan === true);
  return (
    <DirectoryPage
      data={data}
      preset={{ basePath: "/software/free", locked: { freePlan: true } }}
      header={
        <DirectoryHeader
          current="/software/free"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Software", href: "/software" },
            { label: "Free plans" },
          ]}
          title="Software with a free plan"
          intro={
            <p>
              {data.products.length} products known to offer a free plan. Free plans often come with
              limits on users, records or features, so check the vendor&rsquo;s plan page before you
              commit. Products where we are not sure about a free plan are left out.
            </p>
          }
        />
      }
    />
  );
}
