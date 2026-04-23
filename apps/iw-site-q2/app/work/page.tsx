import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { WorkPageContent } from "@/components/pages/work-content";
import { buildBreadcrumbJsonLd } from "@/lib/geo-jsonld";
import { pageMetadata, workSeo } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(workSeo, { titleAbsolute: true });

export default function WorkPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "Work", path: "/work" },
        ])}
      />
      <WorkPageContent />
    </>
  );
}
