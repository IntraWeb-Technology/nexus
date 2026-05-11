import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { HomeHeroSection } from "@/components/sections/home-hero";
import { FrictionSection } from "@/components/sections/friction-section";
import { ProofSection } from "@/components/sections/proof-section";
import { ModelSection } from "@/components/sections/model-section";
import { FitSection } from "@/components/sections/fit-section";
import { FinalCTASection } from "@/components/sections/final-cta-section";
import { webPageJsonLd, webSiteJsonLd } from "@/lib/geo-jsonld";
import { pageMetadata, homeSeo } from "@/lib/seo-meta";

export const metadata: Metadata = pageMetadata(homeSeo, { titleAbsolute: true });

export default function Home() {
  return (
    <main>
      <JsonLd data={webSiteJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <HomeHeroSection />
      <FrictionSection />
      <ProofSection />
      <ModelSection />
      <FitSection />
      <FinalCTASection />
    </main>
  );
}
