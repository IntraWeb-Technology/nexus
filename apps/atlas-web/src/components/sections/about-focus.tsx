import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutFocusProps = {
  data: AboutFixture["focus"];
  notesCondensed?: string;
};

/**
 * Current focus — full desktop composition with status card.
 * Tablet/mobile Figma merges focus + personal note into one block.
 */
export function AboutFocus({ data, notesCondensed }: AboutFocusProps) {
  return (
    <section
      aria-labelledby="about-focus-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 py-8 tablet:py-10 desktop:py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <div className="flex flex-col gap-8 desktop:flex-row desktop:gap-12">
          <div className="max-w-[45rem] space-y-3.5">
            <h2
              id="about-focus-title"
              className="m-0 font-display text-[1.25rem] leading-snug font-medium text-atlas-ink tablet:text-[1.375rem] desktop:text-2xl desktop:leading-[30px]"
            >
              {data.title}
            </h2>
            <p className="m-0 hidden font-sans text-[15px] leading-6 text-atlas-body desktop:block">
              {data.body}
            </p>
            <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
              {data.bodyCondensed}
            </p>
            {notesCondensed ? (
              <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body desktop:hidden">
                {notesCondensed}
              </p>
            ) : null}
          </div>

          <aside className="hidden w-full max-w-[25rem] shrink-0 flex-col gap-2.5 rounded-[2px] border border-atlas-border bg-atlas-elevated p-5 desktop:flex">
            <p className="m-0 font-mono text-[9px] tracking-[0.08em] text-atlas-body">
              {data.statusLabel}
            </p>
            <p className="m-0 font-sans text-sm font-semibold text-atlas-ink">
              {data.status}
            </p>
            <p className="m-0 font-mono text-[9px] tracking-[0.08em] text-atlas-body">
              {data.themesLabel}
            </p>
            <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
              {data.themes}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
