import type { AboutFixture } from "@/content/about";

type AboutOpeningProps = {
  data: AboutFixture["opening"];
};

/** Approved About opening — headline + identity + quiet headshot plane. */
export function AboutOpening({ data }: AboutOpeningProps) {
  return (
    <header className="mx-auto max-w-[var(--atlas-page)]">
      <div className="atlas-pad-x flex flex-col gap-10 pt-14 pb-12 tablet:pt-16 tablet:pb-14 desktop:flex-row desktop:items-start desktop:justify-between desktop:gap-16 desktop:pt-[5.5rem] desktop:pb-16">
        <div className="max-w-[42.5rem] space-y-8">
          <h1 className="m-0 font-display text-[1.75rem] leading-[1.2] font-semibold text-atlas-ink tablet:text-[2.25rem] desktop:text-[2.75rem] desktop:leading-[3.5rem]">
            {data.title}
          </h1>
          <div className="space-y-1">
            <p className="m-0 font-sans text-[15px] font-medium text-atlas-ink">
              {data.meta}
            </p>
            <p className="m-0 font-sans text-sm text-atlas-body">
              {data.marginNote.body}
            </p>
          </div>
        </div>

        <div
          className="hidden h-80 w-72 shrink-0 rounded-[2px] border border-[#c8beaa] bg-atlas-secondary desktop:block"
          role="img"
          aria-label="Portrait placeholder for John Schibelli"
        />
      </div>
    </header>
  );
}
