import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { Figure } from "@/components/editorial/figure";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseImplementationProps = {
  data: CaseStudyFixture["implementation"];
  figures: CaseStudyFixture["figures"];
};

export function CaseImplementation({ data, figures }: CaseImplementationProps) {
  return (
    <section
      id="implementation"
      aria-labelledby="case-implementation-title"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] scroll-mt-24 py-5 tablet:py-7 desktop:py-6 desktop:pb-12"
    >
      <div className="mb-3 space-y-2.5 desktop:mb-7">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="case-implementation-title"
          className="m-0 font-display text-xl leading-[26px] font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:text-[1.75rem] desktop:leading-9"
        >
          <span className="tablet:hidden">{data.titleMobile}</span>
          <span className="hidden tablet:inline">{data.title}</span>
        </h2>
        <p className="m-0 hidden max-w-[var(--atlas-reading)] font-sans text-[15px] leading-[23px] text-atlas-body desktop:block">
          {data.intro}
        </p>
        <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body tablet:block desktop:hidden">
          {data.introTablet}
        </p>
        <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body tablet:hidden">
          {data.introMobile}
        </p>
      </div>

      {/* Desktop 2-column figure grid */}
      <div className="hidden gap-6 desktop:flex">
        <Figure
          tone={figures.implementationPrimary.tone}
          alt={figures.implementationPrimary.alt}
          caption={figures.implementationPrimary.caption}
          label={figures.implementationPrimary.label}
          className="min-w-0 flex-[840]"
          mediaClassName="min-h-[420px] w-full"
        />
        <div className="flex w-[28rem] shrink-0 flex-col gap-4">
          <Figure
            tone={figures.implementationUi.tone}
            alt={figures.implementationUi.alt}
            caption={figures.implementationUi.caption}
            label={figures.implementationUi.label}
            mediaClassName="min-h-[200px] w-full"
          />
          <Figure
            tone={figures.implementationWorkflow.tone}
            alt={figures.implementationWorkflow.alt}
            caption={figures.implementationWorkflow.caption}
            label={figures.implementationWorkflow.label}
            mediaClassName="min-h-[180px] w-full"
          />
        </div>
      </div>

      {/* Tablet single figure */}
      <Figure
        tone={figures.implementationTablet.tone}
        alt={figures.implementationTablet.alt}
        caption={figures.implementationTablet.caption}
        label={figures.implementationTablet.label}
        className="mt-3 hidden tablet:block desktop:hidden"
        mediaClassName="min-h-[240px] w-full"
      />

      {/* Mobile single figure */}
      <Figure
        tone={figures.implementationMobile.tone}
        alt={figures.implementationMobile.alt}
        caption={figures.implementationMobile.caption}
        label={figures.implementationMobile.label}
        className="mt-3 tablet:hidden"
        mediaClassName="min-h-[160px] w-full"
      />
    </section>
  );
}
