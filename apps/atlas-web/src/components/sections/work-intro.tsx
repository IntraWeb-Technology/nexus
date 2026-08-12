import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { WorkFixture } from "@/content/work";

type WorkIntroProps = {
  data: WorkFixture["intro"];
};

export function WorkIntro({ data }: WorkIntroProps) {
  return (
    <header className="mx-auto max-w-[var(--atlas-page)]">
      <div className="atlas-pad-x pt-9 pb-8 tablet:pt-12 tablet:pb-10 desktop:pt-[4.5rem] desktop:pb-14">
        <div className="space-y-3.5 pb-1.5">
          <ChapterMarker>{data.chapter}</ChapterMarker>
          <h1 className="m-0 font-display text-[1.75rem] leading-[1.2] font-semibold text-atlas-ink tablet:text-[2rem] tablet:leading-[1.2] desktop:text-[2.625rem] desktop:leading-[58px]">
            {data.title}
          </h1>
        </div>

        <div className="mt-4 flex flex-col gap-8 desktop:mt-7 desktop:flex-row desktop:gap-16">
          <div className="max-w-[45rem] space-y-5">
            <p className="m-0 hidden font-sans text-[15px] leading-7 text-atlas-body tablet:block desktop:text-[17px]">
              {data.deck}
            </p>
            <p className="m-0 font-sans text-sm leading-[1.55] text-atlas-body tablet:hidden">
              {data.deckMobile}
            </p>

            {/* Desktop: three meta cells */}
            <dl className="m-0 hidden list-none gap-7 p-0 desktop:flex">
              {data.meta.map((item) => (
                <div key={item.label}>
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="m-0 font-mono text-[11px] text-atlas-body whitespace-pre">
                    {item.label}
                    {"  ·  "}
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Tablet: Role + Focus */}
            <p className="m-0 hidden font-mono text-[11px] text-atlas-body whitespace-pre tablet:block desktop:hidden">
              {data.meta[0].label} · {data.meta[0].value}
              {"  ·  "}
              {data.meta[1].label} · {data.meta[1].value}
            </p>

            {/* Mobile: condensed */}
            <p className="m-0 font-mono text-[10px] text-atlas-body tablet:hidden">
              {data.meta[0].value} · {data.meta[1].value}
            </p>
          </div>

          <aside className="hidden w-full max-w-[25rem] shrink-0 space-y-2.5 desktop:block">
            <ChapterMarker>{data.editorialNote.label}</ChapterMarker>
            <p className="m-0 font-sans text-[13px] leading-[22px] text-atlas-body">
              {data.editorialNote.body}
            </p>
          </aside>
        </div>

        <hr className="atlas-hairline mt-8 hidden desktop:mt-3 desktop:block" />
      </div>
    </header>
  );
}
