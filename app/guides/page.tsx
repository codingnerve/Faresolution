import { SectionIndexPage, sectionMetadata } from "@/components/editorial/SectionIndexPage";

export const metadata = sectionMetadata("guide");

export default function Page() {
  return <SectionIndexPage kind="guide" />;
}
