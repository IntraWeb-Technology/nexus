import { HomeAbout } from "@/components/sections/home-about";
import { HomeContact } from "@/components/sections/home-contact";
import { HomeFeatured } from "@/components/sections/home-featured";
import { HomeHero } from "@/components/sections/home-hero";
import { HomePhilosophy } from "@/components/sections/home-philosophy";
import { HomeSelected } from "@/components/sections/home-selected";
import { HomeWriting } from "@/components/sections/home-writing";
import { getHomepageContent } from "@/lib/content";

export default async function HomePage() {
  const data = await getHomepageContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <HomeHero data={data.hero} />

      <div className="h-16" aria-hidden="true" />

      <HomeFeatured data={data.featured} />

      <div className="h-[4.5rem]" aria-hidden="true" />

      <HomeSelected data={data.selected} />

      <div className="h-[4.5rem]" aria-hidden="true" />

      <HomePhilosophy data={data.philosophy} />

      <div className="h-14" aria-hidden="true" />

      <HomeWriting data={data.writing} />

      <div className="h-12" aria-hidden="true" />

      <HomeAbout data={data.about} />

      <div className="h-14" aria-hidden="true" />

      <HomeContact data={data.contact} />
    </main>
  );
}
