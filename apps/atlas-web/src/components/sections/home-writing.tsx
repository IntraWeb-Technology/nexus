import Link from "next/link";
import type { HomepageFixture } from "@/content/homepage";

type HomeWritingProps = {
  data: HomepageFixture["writing"];
};

const coverToneClass: Record<
  NonNullable<HomepageFixture["writing"]["items"][number]["coverTone"]>,
  string
> = {
  rust: "bg-atlas-rust",
  gold: "bg-atlas-gold",
  clay: "bg-atlas-clay",
};

/**
 * Story-First writing strip — Newsreader head + rust publication link,
 * 3-col cover cards with colored cover blocks.
 */
export function HomeWriting({ data }: HomeWritingProps) {
  const sectionTitle = data.sectionTitle ?? "Latest writing";
  const viewAll = data.viewAll ?? {
    label: "Visit the publication →",
    href: "/articles",
  };
  const deck = data.deck ?? "Notes on the work, and what it's teaching me.";
  const tones = ["rust", "gold", "clay"] as const;

  return (
    <section
      aria-labelledby="writing-heading"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x space-y-4 pt-14 pb-8 tablet:pt-16 desktop:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2
            id="writing-heading"
            className="m-0 font-display text-[1.75rem] leading-tight font-semibold text-atlas-ink tablet:text-[2rem] desktop:text-[2.125rem]"
          >
            {sectionTitle}
          </h2>
          <Link
            href={viewAll.href}
            className="font-sans text-[15px] font-medium text-atlas-rust-ink no-underline transition-opacity duration-[var(--atlas-motion-fast)] hover:opacity-80"
          >
            {viewAll.label}
          </Link>
        </div>
        <p className="m-0 max-w-[37.5rem] font-sans text-[15px] leading-relaxed text-atlas-body">
          {deck}
        </p>
      </div>

      <ul className="atlas-pad-x m-0 grid list-none grid-cols-1 gap-8 p-0 pb-14 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-8 desktop:pb-16">
        {data.items.map((item, index) => {
          const tone = item.coverTone ?? tones[index % tones.length]!;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex flex-col gap-3.5 no-underline"
              >
                <div
                  className={`min-h-[180px] rounded-[2px] ${coverToneClass[tone]} transition-[filter] duration-[var(--atlas-motion-base)] group-hover:brightness-[1.05] group-focus-visible:brightness-[1.05]`}
                  aria-hidden="true"
                />
                <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-label uppercase">
                  {item.topic ?? item.note}
                </p>
                <h3 className="m-0 font-display text-lg leading-snug font-semibold text-atlas-ink transition-colors duration-[var(--atlas-motion-fast)] group-hover:text-atlas-rust-ink group-focus-visible:text-atlas-rust-ink">
                  {item.title}
                </h3>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
