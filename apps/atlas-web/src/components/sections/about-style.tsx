import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutStyleProps = {
  data: AboutFixture["style"];
};

/** Desktop-only — tablet/mobile Figma omits Working Style as a full section. */
export function AboutStyle({ data }: AboutStyleProps) {
  return (
    <section
      aria-labelledby="about-style-title"
      className="mx-auto hidden max-w-[var(--atlas-page)] desktop:block"
    >
      <div className="atlas-pad-x space-y-6 py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="about-style-title"
          className="m-0 font-display text-[1.625rem] leading-8 font-medium text-atlas-ink"
        >
          {data.title}
        </h2>
        <ul className="m-0 flex list-none gap-8 p-0">
          {data.items.map((item) => (
            <li key={item.title} className="min-w-0 flex-1 space-y-2.5">
              <p className="m-0 font-sans text-sm font-semibold text-atlas-ink">
                {item.title}
              </p>
              <p className="m-0 font-sans text-sm leading-[22px] text-atlas-body">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
