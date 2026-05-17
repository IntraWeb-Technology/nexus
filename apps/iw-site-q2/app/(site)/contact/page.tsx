import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ContactPageContent } from "@/components/pages/contact-content";
import { buildBreadcrumbJsonLd } from "@/lib/geo-jsonld";
import { contactSeo, pageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(contactSeo, { titleAbsolute: true });

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "IntraWeb Technologies", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <ContactPageContent />
    </>
  );
}
