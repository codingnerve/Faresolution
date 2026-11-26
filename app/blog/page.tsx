import { SectionIndexPage, sectionMetadata } from "@/components/editorial/SectionIndexPage";

export const metadata = sectionMetadata("blog");

export default function Page() {
  return <SectionIndexPage kind="blog" />;
}
