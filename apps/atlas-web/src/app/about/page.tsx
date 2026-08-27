import type { Metadata } from "next";
import { AboutOpening } from "@/components/sections/about-opening";
import { AboutTimeline } from "@/components/sections/about-timeline";
import { AboutWorkingNotes } from "@/components/sections/about-working-notes";
import { getAboutContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

/** Story-First About — narrative, career evidence, Working Notes. */
export default async function AboutPage() {
  const data = await getAboutContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <AboutOpening data={data.opening} />
      <AboutTimeline data={data.timeline} />
      <AboutWorkingNotes data={data.workingNotes} />
    </main>
  );
}
