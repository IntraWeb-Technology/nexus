import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { AboutPageContent } from "@/components/pages/about/about-page";
import { buildBreadcrumbJsonLd, personJsonLd } from "@/lib/geo-jsonld";
import { aboutSeo, pageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(aboutSeo, { titleAbsolute: true });

export default function AboutPage() {
  return (
    <>
      <JsonLd data={personJsonLd} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <AboutPageContent />
    </>
  );
}
