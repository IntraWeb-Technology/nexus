import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { ProblemSection } from "@/components/sections/problem";
import { ServicesOverviewSection } from "@/components/sections/services-overview";
import { ProcessSection } from "@/components/sections/process";
import { DiagnosticSection } from "@/components/sections/diagnostic";
import { DifferentiatorsSection } from "@/components/sections/differentiators";
import { StatsSection } from "@/components/sections/stats";
import { TrustSection } from "@/components/sections/trust";
import { CtaSection } from "@/components/sections/cta";
import { FaqSection } from "@/components/sections/faq";

export const metadata: Metadata = {
  title: "IntraWeb | AI Automation & Web Systems for SMBs",
  description:
    "IntraWeb builds AI-powered web systems, workflow automation, and intelligent integrations for SMBs. Based in NJ, serving the NY metro and remote nationwide.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <ProblemSection />
      <ServicesOverviewSection />
      <ProcessSection />
      <DiagnosticSection />
      <DifferentiatorsSection />
      <StatsSection />
      <TrustSection />
      <CtaSection />
      <FaqSection />
    </main>
  );
}
