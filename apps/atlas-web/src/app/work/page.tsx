import type { Metadata } from "next";
import { WorkContact } from "@/components/sections/work-contact";
import { WorkFeatured } from "@/components/sections/work-featured";
import { WorkIntro } from "@/components/sections/work-intro";
import { WorkSelected } from "@/components/sections/work-selected";
import { StageRule } from "@/components/sections/work-stage-rule";
import { WorkTaxonomy } from "@/components/sections/work-taxonomy";
import { workFixture } from "@/content/work";

export const metadata: Metadata = {
  title: workFixture.seo.title,
  description: workFixture.seo.description,
};

export default function WorkPage() {
  const data = workFixture;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <WorkIntro data={data.intro} />
      <StageRule label={data.stageRules.afterIntro} />
      <div className="hidden h-12 desktop:block" aria-hidden="true" />

      <WorkFeatured data={data.featured} />
      <StageRule label={data.stageRules.afterFeatured} />
      <div className="hidden h-16 desktop:block" aria-hidden="true" />

      <WorkSelected data={data.selected} />
      <StageRule label={data.stageRules.afterSelected} />
      <div className="hidden h-14 desktop:block" aria-hidden="true" />

      <WorkTaxonomy data={data.taxonomy} />
      <StageRule label={data.stageRules.afterTaxonomy} />
      <div className="hidden h-10 desktop:block" aria-hidden="true" />

      <WorkContact data={data.contact} />
      <StageRule label={data.stageRules.afterContact} />
    </main>
  );
}
