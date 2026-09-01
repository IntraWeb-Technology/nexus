import { Reveal } from "@/components/editorial/reveal";
import { HomeAbout } from "@/components/sections/home-about";
import { HomeContact } from "@/components/sections/home-contact";
import { HomeHero } from "@/components/sections/home-hero";
import { HomeLatestWork } from "@/components/sections/home-latest-work";
import { HomePhilosophy } from "@/components/sections/home-philosophy";
import { HomeWriting } from "@/components/sections/home-writing";
import { getHomepageContent } from "@/lib/content";

export default async function HomePage() {
  const data = await getHomepageContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <HomeHero data={data.hero} />

      <Reveal>
        <HomeLatestWork featured={data.featured} selected={data.selected} />
      </Reveal>

      <Reveal>
        <HomePhilosophy data={data.philosophy} />
      </Reveal>

      <Reveal>
        <HomeWriting data={data.writing} />
      </Reveal>

      <HomeAbout data={data.about} />

      <HomeContact data={data.contact} />
    </main>
  );
}
