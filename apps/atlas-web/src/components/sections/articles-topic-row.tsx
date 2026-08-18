import type { ArticlesIndexFixture } from "@/content/article";

type ArticlesTopicRowProps = {
  data: ArticlesIndexFixture["topics"];
};

/** Editorial taxonomy labels — noninteractive until filtering ships. */
export function ArticlesTopicRow({ data }: ArticlesTopicRowProps) {
  return (
    <section
      aria-label="Topics"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-3 pt-2 pb-6 tablet:pb-5 desktop:pb-8">
        <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
          {data.label}
        </p>

        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="rounded-full border border-atlas-border bg-atlas-paper px-3.5 py-1.5 font-sans text-xs font-medium text-atlas-ink"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
