import { SectionIndexPage, sectionMetadata } from "@/components/editorial/SectionIndexPage";

export const metadata = sectionMetadata("buying-guide");

export default function Page() {
  return <SectionIndexPage kind="buying-guide" />;
}
