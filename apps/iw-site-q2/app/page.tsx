import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { GeoFaqBlock } from "@/components/geo-faq-block";
import { Hero } from "@/components/sections/hero";
import { ProblemSection } from "@/components/sections/problem";
import { ServicesOverviewSection } from "@/components/sections/services-overview";
import { ProcessSection } from "@/components/sections/process";
import { DiagnosticSection } from "@/components/sections/diagnostic";
import { DifferentiatorsSection } from "@/components/sections/differentiators";
import { StatsSection } from "@/components/sections/stats";
import { TrustSection } from "@/components/sections/trust";
import { CtaSection } from "@/components/sections/cta";
import { homeFaqPageJsonLd, webPageJsonLd, webSiteJsonLd } from "@/lib/geo-jsonld";
import { pageMetadata, homeSeo } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(homeSeo, { titleAbsolute: true });

export default function Home() {
  return (
    <main>
      <JsonLd data={webSiteJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={homeFaqPageJsonLd} />
      <Hero />
      <ProblemSection />
      <GeoFaqBlock className="marketing-slab" id="faq" />
      <ServicesOverviewSection />
      <ProcessSection />
      <DiagnosticSection />
      <DifferentiatorsSection />
      <StatsSection />
      <TrustSection />
      <CtaSection />
    </main>
  );
}
