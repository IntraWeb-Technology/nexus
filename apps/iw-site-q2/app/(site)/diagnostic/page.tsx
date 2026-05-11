import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { DiagnosticPageContent } from "@/components/pages/diagnostic-content";
import {
  buildBreadcrumbJsonLd,
  diagnosticHowToJsonLd,
  diagnosticServiceJsonLd,
  homeFaqPageJsonLd,
} from "@/lib/geo-jsonld";
import { diagnosticSeo, pageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(diagnosticSeo, { titleAbsolute: true });

export default function DiagnosticPage() {
  return (
    <>
      <JsonLd data={diagnosticServiceJsonLd} />
      <JsonLd data={diagnosticHowToJsonLd} />
      <JsonLd data={homeFaqPageJsonLd} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "AI Workflow Diagnostic", path: "/diagnostic" },
        ])}
      />
      <DiagnosticPageContent />
    </>
  );
}
