import type { ArticlesIndexFixture } from "@/content/article";

type ArticlesIntroProps = {
  data: ArticlesIndexFixture["intro"];
};

export function ArticlesIntro({ data }: ArticlesIntroProps) {
  return (
    <header className="mx-auto max-w-[var(--atlas-page)]">
      <div className="atlas-pad-x space-y-5 pt-10 pb-8 tablet:space-y-5 tablet:pt-12 tablet:pb-10 desktop:gap-5 desktop:pt-16 desktop:pb-8">
        <p className="m-0 font-sans text-[12px] font-medium tracking-[0.08em] text-atlas-rust-ink uppercase">
          {data.chapter}
        </p>
        <h1 className="m-0 max-w-[47.5rem] font-display text-[2rem] leading-10 font-semibold text-atlas-ink tablet:text-[2.5rem] tablet:leading-[48px] desktop:text-5xl desktop:leading-[56px]">
          {data.title}
        </h1>
        <p className="m-0 hidden max-w-[45rem] font-sans text-base leading-[26px] text-atlas-body desktop:block">
          {data.dek}
        </p>
        <p className="m-0 max-w-[45rem] font-sans text-base leading-6 text-atlas-body desktop:hidden">
          {data.dekCompact}
        </p>
      </div>
    </header>
  );
}
