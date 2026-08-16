import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { AboutFixture } from "@/content/about";

type AboutPrinciplesProps = {
  data: AboutFixture["principles"];
};

/** How I Work — title / thought rows per approved About. */
export function AboutPrinciples({ data }: AboutPrinciplesProps) {
  return (
    <section
      aria-labelledby="about-how-i-work"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-6 py-10 tablet:py-12 desktop:py-14">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2 id="about-how-i-work" className="sr-only">
          How I work
        </h2>
        <ul className="m-0 list-none space-y-0 border-t border-atlas-border p-0">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="grid gap-2 border-b border-atlas-border py-5 tablet:grid-cols-[17.5rem_minmax(0,32.5rem)] tablet:gap-10 desktop:py-6"
            >
              <p className="m-0 font-sans text-sm font-semibold tracking-[0.04em] text-atlas-ink uppercase">
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
