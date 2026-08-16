import type { Metadata } from "next";
import { AboutContact } from "@/components/sections/about-contact";
import { AboutFocus } from "@/components/sections/about-focus";
import { AboutOpening } from "@/components/sections/about-opening";
import { AboutPrinciples } from "@/components/sections/about-principles";
import { AboutTimeline } from "@/components/sections/about-timeline";
import { getAboutContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

/** Approved — About: Opening → Career Arc → How I Work → Current Focus → Contact. */
export default async function AboutPage() {
  const data = await getAboutContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <AboutOpening data={data.opening} />
      <AboutTimeline data={data.timeline} />
      <AboutPrinciples data={data.principles} />
      <AboutFocus data={data.focus} />
      <AboutContact data={data.contact} />
    </main>
  );
}
