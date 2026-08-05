import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ServicesPageContent } from "@/components/pages/services-content";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, itemListServiceJsonLd } from "@/lib/geo-jsonld";
import { pageMetadata, servicesSeo } from "@/lib/seo-meta";
import { resolveCmsServices, resolveGeoFaqItems } from "@/lib/strapi-content";

export const metadata: Metadata = pageMetadata(servicesSeo, { titleAbsolute: true });

export default async function ServicesPage() {
  const [faqItems, cmsServices] = await Promise.all([resolveGeoFaqItems(), resolveCmsServices()]);

  return (
    <>
      <JsonLd data={itemListServiceJsonLd} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <JsonLd data={buildFaqPageJsonLd(faqItems)} />
      <ServicesPageContent faqItems={faqItems} cmsServices={cmsServices} />
    </>
  );
}
