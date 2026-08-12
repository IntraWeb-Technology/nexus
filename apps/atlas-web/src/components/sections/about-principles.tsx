import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutPrinciplesProps = {
  data: AboutFixture["principles"];
};

export function AboutPrinciples({ data }: AboutPrinciplesProps) {
  return (
    <section
      aria-labelledby="about-principles-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-5 py-8 tablet:py-10 desktop:space-y-5 desktop:py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="about-principles-title"
          className="m-0 hidden font-display text-[1.625rem] leading-8 font-medium text-atlas-ink desktop:block"
        >
          {data.title}
        </h2>
        <ol className="m-0 list-none space-y-0 p-0">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 border-t border-atlas-border py-3.5 desktop:gap-6 desktop:py-[18px]"
            >
              <span className="shrink-0 font-mono text-[13px] font-medium text-atlas-sage">
                {item.id}
              </span>
              <div className="min-w-0 space-y-1.5">
                <p className="m-0 font-sans text-sm font-semibold text-atlas-ink desktop:text-[15px]">
                  {item.title}
                </p>
                <p className="m-0 hidden font-sans text-sm leading-[22px] text-atlas-body desktop:block">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
