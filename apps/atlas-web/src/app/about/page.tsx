import type { Metadata } from "next";
import { AboutOpening } from "@/components/sections/about-opening";
import { AboutTimeline } from "@/components/sections/about-timeline";
import { getAboutContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

/** Story-First About — Opening + Timeline only. */
export default async function AboutPage() {
  const data = await getAboutContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <AboutOpening data={data.opening} />
      <AboutTimeline data={data.timeline} />
    </main>
  );
}
