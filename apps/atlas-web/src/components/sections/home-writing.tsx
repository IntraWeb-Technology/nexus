import Link from "next/link";
import { ChapterMarker } from "@/components/editorial/chapter-marker";
import type { HomepageFixture } from "@/content/homepage";

type HomeWritingProps = {
  data: HomepageFixture["writing"];
};

/** Thin evidence strip — present on frozen Homepage Figma (Stage 05). */
export function HomeWriting({ data }: HomeWritingProps) {
  return (
    <section
      aria-labelledby="writing-heading"
      className="atlas-pad-x mx-auto max-w-[var(--atlas-page)] py-6"
    >
      <h2 id="writing-heading" className="sr-only">
        Documentation and writing
      </h2>
      <ChapterMarker className="mb-3">{data.chapter}</ChapterMarker>
      <ul className="m-0 flex list-none flex-col gap-4 p-0 tablet:flex-row tablet:gap-12">
        {data.items.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              className="font-sans text-sm text-atlas-ink no-underline"
            >
              {item.title}
            </Link>
            <p className="mt-1 mb-0 font-sans text-xs text-atlas-body">
              {item.note}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
