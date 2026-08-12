import { AtlasBoundaryDiagram } from "@/components/editorial/atlas-boundary-diagram";
import { Callout } from "@/components/editorial/callout";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { CodeBlock } from "@/components/editorial/code-block";
import { EditorialDataTable } from "@/components/editorial/editorial-table";
import { EvidenceBlock } from "@/components/editorial/evidence-block";
import { Figure } from "@/components/editorial/figure";
import { TerminalBlock } from "@/components/editorial/terminal-block";
import type { DocDetail, DocSection } from "@/content/doc";

type DocBodyProps = {
  sections: DocDetail["sections"];
};

function DocFigure({ section }: { section: DocSection }) {
  if (!section.figure) return null;
  const figure = section.figure;
  if (figure.composed === "atlas-boundaries") {
    return (
      <AtlasBoundaryDiagram
        caption={figure.caption}
        captionCompact={figure.captionCompact}
      />
    );
  }
  return (
    <Figure
      alt={figure.alt}
      caption={figure.captionCompact ?? figure.caption}
      label={figure.labelCompact ?? figure.label}
      labelAlign="center"
      src={figure.src}
      width={figure.width}
      height={figure.height}
      sizes={figure.sizes}
      className="w-full"
      mediaClassName="min-h-[220px] w-full tablet:min-h-[260px] desktop:h-[360px]"
    />
  );
}

function FigureOnly({ section }: { section: DocSection }) {
  if (!section.figure) return null;
  return (
    <section
      id={section.id}
      aria-label={section.figure.alt}
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x pt-2 pb-10 tablet:pt-1 tablet:pb-8 desktop:pt-2 desktop:pb-10">
        <DocFigure section={section} />
      </div>
    </section>
  );
}

function SectionBlock({ section }: { section: DocSection }) {
  if (section.figure && !section.title) {
    return <FigureOnly section={section} />;
  }

  const paragraphs = section.paragraphs;
  const paragraphsTablet = section.paragraphsTablet ?? section.paragraphs;

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 pt-4 pb-10 tablet:space-y-4 tablet:pt-2 tablet:pb-8 desktop:space-y-5 desktop:pt-4 desktop:pb-10">
        <ChapterMarker>{section.chapter}</ChapterMarker>
        <h2
          id={`${section.id}-title`}
          className="m-0 max-w-[45rem] font-display text-[1.375rem] leading-8 font-semibold text-atlas-ink tablet:text-2xl tablet:leading-8 desktop:text-[1.75rem] desktop:leading-9"
        >
          {section.title}
        </h2>

        <div className="hidden max-w-[45rem] space-y-5 desktop:block">
          {paragraphs.map((p, i) => (
            <p
              key={`${section.id}-d-${i}`}
              className="m-0 font-sans text-base leading-7 text-atlas-body"
            >
              {p}
            </p>
          ))}
        </div>
        <div className="max-w-[45rem] space-y-4 desktop:hidden">
          {paragraphsTablet.map((p, i) => (
            <p
              key={`${section.id}-t-${i}`}
              className="m-0 font-sans text-base leading-7 text-atlas-body"
            >
              {p}
            </p>
          ))}
        </div>

        {section.figure ? <DocFigure section={section} /> : null}

        {section.callout ? (
          <Callout
            variant={section.callout.variant}
            title={section.callout.title}
            className="w-full"
          >
            <span className="hidden desktop:inline">{section.callout.body}</span>
            <span className="desktop:hidden">
              {section.callout.bodyCompact ?? section.callout.body}
            </span>
          </Callout>
        ) : null}

        {section.table ? (
          <EditorialDataTable
            caption={section.table.caption}
            columns={section.table.columns}
            rows={section.table.rows}
            className="w-full"
          />
        ) : null}

        {section.evidence ? (
          <EvidenceBlock
            kind={section.evidence.kind}
            title={section.evidence.title}
            status={section.evidence.status}
            meta={section.evidence.meta}
            href={section.evidence.href}
            hrefLabel={section.evidence.hrefLabel}
            className="w-full"
          />
        ) : null}

        {section.code ? (
          <CodeBlock
            language={section.code.language}
            code={section.code.code}
            caption={section.code.caption}
            className="w-full"
          />
        ) : null}

        {section.terminal ? (
          <TerminalBlock
            lines={section.terminal.lines}
            caption={section.terminal.caption}
            className="w-full"
          />
        ) : null}
      </div>
    </section>
  );
}

/**
 * Documentation body — explicit section composition from fixture blocks.
 * Parallel to ArticleBody; not a shared generic renderer.
 */
export function DocBody({ sections }: DocBodyProps) {
  return (
    <>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </>
  );
}
