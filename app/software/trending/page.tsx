import type { Metadata } from "next";
import { DirectoryHeader, DirectoryPage } from "@/components/directory/DirectoryPage";
import { getDirectoryData } from "@/lib/directory/data";
import { buildMetadata } from "@/lib/seo";

const title = "Editor's picks: software worth a look";
const description =
  "A shortlist of business software picked and ordered by Faresolution's editors. Editorial judgement, not traffic or review data.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/software/trending" });

export default async function TrendingSoftwarePage() {
  // Only products the editors have ranked; the order is the editorial ranking.
  const data = await getDirectoryData((p) => p.trendingRank !== null);
  return (
    <DirectoryPage
      data={data}
      preset={{ basePath: "/software/trending", locked: { sort: "trending" } }}
      header={
        <DirectoryHeader
          current="/software/trending"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Software", href: "/software" },
            { label: "Editor's picks" },
          ]}
          eyebrow="Editor-curated"
          title="Editor's picks"
          intro={
            <p>
              {data.products.length} products our editors think are worth a look right now, in the
              order they would start with. This is an editorial selection: it is not based on
              traffic, sales or reviews.
            </p>
          }
        />
      }
    />
  );
}
