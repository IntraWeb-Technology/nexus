import type { Metadata } from "next";
import { Reveal } from "@/components/editorial/reveal";
import { WorkGallery } from "@/components/sections/work-gallery";
import { WorkIntro } from "@/components/sections/work-intro";
import { getWorkContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getWorkContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

/** Story-First work landing — intro + alternating gallery rows only. */
export default async function WorkPage() {
  const data = await getWorkContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <WorkIntro data={data.intro} />
      <Reveal>
        <WorkGallery projects={data.gallery.projects} />
      </Reveal>
    </main>
  );
}
