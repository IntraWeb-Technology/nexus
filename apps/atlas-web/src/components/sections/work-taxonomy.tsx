import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { WorkFixture } from "@/content/work";

type WorkTaxonomyProps = {
  data: WorkFixture["taxonomy"];
};

export function WorkTaxonomy({ data }: WorkTaxonomyProps) {
  const condensed = data.categories
    .map((c) => `${c.index} ${c.label}`)
    .join(" · ");

  return (
    <section
      aria-labelledby="work-taxonomy-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-2.5 pt-4 pb-6 tablet:pt-6 tablet:pb-8 desktop:space-y-2.5 desktop:pt-8 desktop:pb-0">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h2
          id="work-taxonomy-title"
          className="m-0 font-display text-lg font-semibold text-atlas-ink tablet:text-xl desktop:text-2xl desktop:leading-[30px]"
        >
          {data.title}
        </h2>
        <p className="m-0 hidden max-w-[40rem] font-sans text-sm leading-[22px] text-atlas-body desktop:block">
          {data.deck}
        </p>
      </div>

      {/* Desktop: numbered rows with descriptions */}
      <div className="atlas-pad-x hidden pb-12 desktop:block">
        <ol className="m-0 list-none p-0">
          {data.categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center gap-8 border-t border-atlas-border py-6"
            >
              <div className="flex items-center gap-5">
                <span className="font-mono text-xs text-atlas-sage">
                  {category.index}
                </span>
                <span className="font-sans text-[15px] font-semibold text-atlas-ink">
                  {category.label}
                </span>
              </div>
              <p className="m-0 max-w-md flex-1 font-sans text-[13px] leading-5 text-atlas-body">
                {category.description}
              </p>
            </li>
          ))}
        </ol>
        <hr className="atlas-hairline" />
      </div>

      {/* Tablet: numbered names only */}
      <div className="atlas-pad-x hidden pb-10 tablet:block desktop:hidden">
        <ol className="m-0 list-none p-0">
          {data.categories.map((category) => (
            <li
              key={category.id}
              className="border-t border-atlas-border py-3.5 font-sans text-sm text-atlas-ink"
            >
              <span className="font-mono text-atlas-sage">{category.index}</span>
              {"  "}
              {category.label}
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile: condensed line */}
      <p className="atlas-pad-x m-0 pb-8 font-sans text-xs leading-5 text-atlas-body tablet:hidden">
        {condensed}
      </p>
    </section>
  );
}
