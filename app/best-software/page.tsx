import { SectionIndexPage, sectionMetadata } from "@/components/editorial/SectionIndexPage";

export const metadata = sectionMetadata("best-software");

export default function Page() {
  return <SectionIndexPage kind="best-software" />;
}
