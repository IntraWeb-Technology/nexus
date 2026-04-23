import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ServicesPageContent } from "@/components/pages/services-content";
import { buildBreadcrumbJsonLd, homeFaqPageJsonLd, itemListServiceJsonLd } from "@/lib/geo-jsonld";
import { pageMetadata, servicesSeo } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(servicesSeo, { titleAbsolute: true });

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={itemListServiceJsonLd} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <JsonLd data={homeFaqPageJsonLd} />
      <ServicesPageContent />
    </>
  );
}
