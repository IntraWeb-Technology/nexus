import type { Metadata } from "next";
import { Reveal } from "@/components/editorial/reveal";
import { WorkContact } from "@/components/sections/work-contact";
import { WorkFeatured } from "@/components/sections/work-featured";
import { WorkIntro } from "@/components/sections/work-intro";
import { WorkSelected } from "@/components/sections/work-selected";
import { StageRule } from "@/components/sections/work-stage-rule";
import { WorkTaxonomy } from "@/components/sections/work-taxonomy";
import { getWorkContent } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getWorkContent();
  return {
    title: data.seo.title,
    description: data.seo.description,
  };
}

export default async function WorkPage() {
  const data = await getWorkContent();

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <WorkIntro data={data.intro} />
      <StageRule label={data.stageRules.afterIntro} />
      <div className="hidden h-12 desktop:block" aria-hidden="true" />

      <Reveal>
        <WorkFeatured data={data.featured} />
      </Reveal>
      <StageRule label={data.stageRules.afterFeatured} />
      <div className="hidden h-16 desktop:block" aria-hidden="true" />

      <Reveal>
        <WorkSelected data={data.selected} />
      </Reveal>
      <StageRule label={data.stageRules.afterSelected} />
      <div className="hidden h-14 desktop:block" aria-hidden="true" />

      <Reveal>
        <WorkTaxonomy data={data.taxonomy} />
      </Reveal>
      <StageRule label={data.stageRules.afterTaxonomy} />
      <div className="hidden h-10 desktop:block" aria-hidden="true" />

      <WorkContact data={data.contact} />
      <StageRule label={data.stageRules.afterContact} />
    </main>
  );
}
