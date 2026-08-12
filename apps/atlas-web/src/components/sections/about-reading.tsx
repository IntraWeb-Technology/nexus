import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutReadingProps = {
  data: AboutFixture["reading"];
};

/** Desktop-only — tablet/mobile Figma omits the reading grid. */
export function AboutReading({ data }: AboutReadingProps) {
  return (
    <section
      aria-labelledby="about-reading-title"
      className="mx-auto hidden max-w-[var(--atlas-page)] desktop:block"
    >
      <div className="atlas-pad-x space-y-5 py-12">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="about-reading-title"
          className="m-0 font-display text-2xl leading-[30px] font-medium text-atlas-ink"
        >
          {data.title}
        </h2>
        <ul className="m-0 flex list-none gap-6 p-0">
          {data.items.map((item) => (
            <li
              key={item.label}
              className="min-w-0 flex-1 space-y-2 rounded-[2px] bg-atlas-elevated p-[18px]"
            >
              <p className="m-0 font-mono text-[10px] font-medium text-atlas-sage">
                {item.label}
              </p>
              <p className="m-0 font-sans text-[13px] leading-5 text-atlas-body">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
