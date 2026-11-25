import type { Metadata } from "next";
import { DirectoryHeader, DirectoryPage } from "@/components/directory/DirectoryPage";
import { getDirectoryData } from "@/lib/directory/data";

const title = "Recently added software";
const description =
  "The newest profiles in the Faresolution software directory, most recently added first.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/software/new" },
  openGraph: { url: "/software/new", title, description },
};

export default async function NewSoftwarePage() {
  const data = await getDirectoryData();
  return (
    <DirectoryPage
      data={data}
      preset={{ basePath: "/software/new", locked: { sort: "newest" } }}
      header={
        <DirectoryHeader
          current="/software/new"
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Software", href: "/software" },
            { label: "Recently added" },
          ]}
          title="Recently added software"
          intro={
            <p>
              Every profile in the directory, newest first. The date is when a profile was added to
              Faresolution, not when the product launched.
            </p>
          }
        />
      }
    />
  );
}
