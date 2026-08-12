import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { DocDetail } from "@/content/doc";

type DocRelatedProps = {
  data: DocDetail["related"];
};

export function DocRelated({ data }: DocRelatedProps) {
  return (
    <section
      aria-labelledby="doc-related-title"
      className="mx-auto max-w-[var(--atlas-page)] border-t border-atlas-border"
    >
      <div className="atlas-pad-x pt-8 pb-10 tablet:pt-7 tablet:pb-9 desktop:pt-8 desktop:pb-10">
        <ChapterMarker className="mb-4">{data.chapter}</ChapterMarker>
        <h2
          id="doc-related-title"
          className="m-0 mb-4 font-display text-[1.375rem] leading-7 font-semibold text-atlas-ink tablet:text-[1.375rem] tablet:leading-7 desktop:mb-4 desktop:text-2xl desktop:leading-[30px]"
        >
          {data.title}
        </h2>

        <ul className="m-0 list-none p-0">
          {data.items.map((item) => (
            <li key={item.slug} className="border-t border-atlas-border">
              <Link
                href={item.href}
                className="hidden items-center justify-between gap-6 py-4 no-underline desktop:flex"
              >
                <div className="min-w-0 space-y-1">
                  <p className="m-0 font-display text-lg leading-6 font-semibold text-atlas-ink">
                    {item.title}
                  </p>
                  <p className="m-0 font-mono text-[11px] text-atlas-body whitespace-pre">
                    {item.category}
                    {"  ·  "}
                    {item.readingTime}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-[13px] font-medium text-atlas-umber">
                  Read →
                </span>
              </Link>

              <Link
                href={item.href}
                className="block space-y-1.5 py-3.5 no-underline desktop:hidden"
              >
                <p className="m-0 font-display text-base leading-[22px] font-semibold text-atlas-ink tablet:text-lg tablet:leading-[22px]">
                  {item.title}
                </p>
                <p className="m-0 font-mono text-[11px] text-atlas-body">
                  {item.category} · {item.readingTime} · Read →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
