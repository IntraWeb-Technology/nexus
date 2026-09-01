import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseHero } from "@/components/sections/case-hero";
import { CaseMetaRow } from "@/components/sections/case-meta-row";
import { CaseStoryOutcomes } from "@/components/sections/case-story-outcomes";
import { CaseStoryOverview } from "@/components/sections/case-story-overview";
import { CaseUnderTheHood } from "@/components/sections/case-under-the-hood";
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

/**
 * Story-First case study — hero, meta, overview triptych, under the hood, outcomes.
 * Replaces the long-form M9D evidence layout (Figma 616:13 / 632:4 / 632:9).
 */
export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCaseStudyContent(slug);
  if (!data) notFound();

  const underTheHood = data.underTheHood;
  const storyOutcomes = data.storyOutcomes;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <article>
        <CaseHero data={data.hero} />
        <CaseMetaRow items={data.hero.meta} />
        <CaseStoryOverview data={data.overview} />
        {underTheHood ? <CaseUnderTheHood data={underTheHood} /> : null}
        {storyOutcomes ? <CaseStoryOutcomes data={storyOutcomes} /> : null}
      </article>
    </main>
  );
}
