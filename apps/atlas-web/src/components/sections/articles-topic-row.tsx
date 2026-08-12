import type { ArticlesIndexFixture } from "@/content/article";

type ArticlesTopicRowProps = {
  data: ArticlesIndexFixture["topics"];
};

/**
 * Topic taxonomy row — presentational filter labels for M5.
 * Active topic is "All"; filtering deferred until CMS wiring.
 */
export function ArticlesTopicRow({ data }: ArticlesTopicRowProps) {
  return (
    <section
      aria-label="Topics"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-4 pt-2 pb-6 tablet:space-y-4 tablet:pb-5 desktop:pb-6">
        <p className="m-0 font-sans text-[10px] font-medium tracking-[0.16em] text-atlas-body uppercase">
          {data.label}
        </p>

        {/* Desktop + tablet: single row */}
        <p className="m-0 hidden font-sans text-[13px] tablet:block">
          {data.items.map((item, i) => (
            <span key={item.id}>
              {i > 0 ? (
                <span className="text-atlas-border" aria-hidden="true">
                  {"  ·  "}
                </span>
              ) : null}
              <span
                className={
                  item.active
                    ? "font-semibold text-atlas-ink"
                    : "font-normal text-atlas-body"
                }
                aria-current={item.active ? "true" : undefined}
              >
                {item.label}
              </span>
            </span>
          ))}
        </p>

        {/* Mobile: two lines matching Figma recomposition */}
        <div className="space-y-2 tablet:hidden" aria-hidden="true">
          <p className="m-0 font-sans text-[13px]">
            {data.items.slice(0, 3).map((item, i) => (
              <span key={item.id}>
                {i > 0 ? (
                  <span className="text-atlas-border">{"  ·  "}</span>
                ) : null}
                <span
                  className={
                    item.active
                      ? "font-semibold text-atlas-ink"
                      : "font-normal text-atlas-body"
                  }
                >
                  {item.label}
                </span>
              </span>
            ))}
          </p>
          <p className="m-0 font-sans text-[13px]">
            {data.items.slice(3).map((item, i) => (
              <span key={item.id}>
                {i > 0 ? (
                  <span className="text-atlas-border">{"  ·  "}</span>
                ) : null}
                <span className="font-normal text-atlas-body">{item.label}</span>
              </span>
            ))}
          </p>
        </div>

        {/* Screen-reader single list on mobile */}
        <ul className="sr-only tablet:hidden">
          {data.items.map((item) => (
            <li key={item.id} aria-current={item.active ? "true" : undefined}>
              {item.label}
            </li>
          ))}
        </ul>

        <hr className="atlas-hairline" />
      </div>
    </section>
  );
}
