import type { Metadata } from "next";
import { AboutApproach } from "@/components/sections/about-approach";
import { AboutArchitecture } from "@/components/sections/about-architecture";
import { AboutContact } from "@/components/sections/about-contact";
import { AboutFocus } from "@/components/sections/about-focus";
import { AboutNotes } from "@/components/sections/about-notes";
import { AboutOpening } from "@/components/sections/about-opening";
import { AboutPhilosophy } from "@/components/sections/about-philosophy";
import { AboutPrinciples } from "@/components/sections/about-principles";
import { AboutReading } from "@/components/sections/about-reading";
import { AboutStyle } from "@/components/sections/about-style";
import { AboutTimeline } from "@/components/sections/about-timeline";
import { aboutFixture } from "@/content/about";

export const metadata: Metadata = {
  title: aboutFixture.seo.title,
  description: aboutFixture.seo.description,
};

export default function AboutPage() {
  const data = aboutFixture;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <AboutOpening data={data.opening} />
      <AboutPhilosophy data={data.philosophy} />
      <AboutApproach data={data.approach} />
      <AboutStyle data={data.style} />
      <AboutPrinciples data={data.principles} />
      <AboutTimeline data={data.timeline} />
      <AboutFocus
        data={data.focus}
        notesCondensed={data.notes.bodyCondensed}
      />
      <AboutReading data={data.reading} />
      <AboutArchitecture data={data.architecture} />
      <AboutNotes data={data.notes} />
      <AboutContact data={data.contact} />
    </main>
  );
}
