import { SectionIndexPage, sectionMetadata } from "@/components/editorial/SectionIndexPage";

export const metadata = sectionMetadata("research");

export default function Page() {
  return <SectionIndexPage kind="research" />;
}
