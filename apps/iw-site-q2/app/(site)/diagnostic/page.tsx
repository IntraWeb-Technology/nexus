import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { DiagnosticPageContent } from "@/components/pages/diagnostic-content";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  diagnosticHowToJsonLd,
  diagnosticServiceJsonLd,
} from "@/lib/geo-jsonld";
import { diagnosticSeo, pageMetadata } from "@/lib/seo-meta";
import { resolveGeoFaqItems } from "@/lib/strapi-content";

export const metadata: Metadata = pageMetadata(diagnosticSeo, { titleAbsolute: true });

export default async function DiagnosticPage() {
  const faqItems = await resolveGeoFaqItems();

  return (
    <>
      <JsonLd data={diagnosticServiceJsonLd} />
      <JsonLd data={diagnosticHowToJsonLd} />
      <JsonLd data={buildFaqPageJsonLd(faqItems)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "AI Workflow Diagnostic", path: "/diagnostic" },
        ])}
      />
      <DiagnosticPageContent faqItems={faqItems} />
    </>
  );
}
