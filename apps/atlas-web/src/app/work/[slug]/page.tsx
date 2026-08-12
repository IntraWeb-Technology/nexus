import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/chrome/reading-progress";
import { CaseStudyToc } from "@/components/editorial/case-study-toc";
import { CaseArchitecture } from "@/components/sections/case-architecture";
import { CaseConstraints } from "@/components/sections/case-constraints";
import { CaseContact } from "@/components/sections/case-contact";
import { CaseDecisions } from "@/components/sections/case-decisions";
import { CaseDelivery } from "@/components/sections/case-delivery";
import { CaseHero } from "@/components/sections/case-hero";
import { CaseHeroArtifact } from "@/components/sections/case-hero-artifact";
import { CaseImplementation } from "@/components/sections/case-implementation";
import { CaseLessons } from "@/components/sections/case-lessons";
import { CaseOutcomes } from "@/components/sections/case-outcomes";
import { CaseOverview } from "@/components/sections/case-overview";
import { CaseProblem } from "@/components/sections/case-problem";
import { CaseRelated } from "@/components/sections/case-related";
import {
  getCaseStudyContent,
  getCaseStudySlugs,
} from "@/lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyContent(slug);
  if (!study) return {};
  return {
    title: study.seo.title,
    description: study.seo.description,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCaseStudyContent(slug);
  if (!data) notFound();

  return (
    <>
      <ReadingProgress />
      <main id="main" tabIndex={-1} className="outline-none">
        <article>
          <CaseHero data={data.hero} />
          <CaseStudyToc items={data.toc} />
          <CaseHeroArtifact figure={data.figures.hero} />

          <div className="hidden h-12 desktop:block" aria-hidden="true" />
          <CaseOverview data={data.overview} />

          <div className="hidden h-10 desktop:block" aria-hidden="true" />
          <CaseProblem data={data.problem} />

          <div className="hidden h-10 desktop:block" aria-hidden="true" />
          <CaseConstraints data={data.constraints} />

          <div className="hidden h-12 desktop:block" aria-hidden="true" />
          <CaseArchitecture
            data={data.architecture}
            caption={data.figures.architecture.caption}
            captionShort={
              data.figures.architecture.captionShort ??
              data.figures.architecture.caption
            }
          />

          <div className="hidden h-12 desktop:block" aria-hidden="true" />
          <CaseDecisions data={data.decisions} />

          <div className="hidden h-10 desktop:block" aria-hidden="true" />
          <CaseImplementation
            data={data.implementation}
            figures={data.figures}
          />

          <div className="hidden h-10 desktop:block" aria-hidden="true" />
          <CaseDelivery data={data.delivery} />

          <div className="hidden h-10 desktop:block" aria-hidden="true" />
          <CaseOutcomes data={data.outcomes} />

          <div className="hidden h-10 desktop:block" aria-hidden="true" />
          <CaseLessons data={data.lessons} />

          <div className="hidden h-12 desktop:block" aria-hidden="true" />
          <CaseRelated data={data.related} />

          <div className="hidden h-8 desktop:block" aria-hidden="true" />
          <CaseContact data={data.contact} />
        </article>
      </main>
    </>
  );
}
