import Image from "next/image";
import type { CaseStudyFixture } from "@/content/case-study";

type CaseUnderTheHoodProps = {
  data: NonNullable<CaseStudyFixture["underTheHood"]>;
};

/**
 * Story-First Under the Hood — diagram + Constraint / Decision / Delivery.
 */
export function CaseUnderTheHood({ data }: CaseUnderTheHoodProps) {
  return (
    <section
      id="under-the-hood"
      aria-labelledby="case-hood-title"
      className="border-y border-atlas-border bg-atlas-elevated"
    >
      <div className="atlas-pad-x mx-auto flex max-w-[var(--atlas-page)] flex-col gap-10 py-14 tablet:gap-12 tablet:py-16 desktop:gap-10 desktop:py-24">
        <div className="flex flex-col gap-2.5">
          <p className="m-0 font-mono text-[12px] tracking-[0.08em] text-atlas-label uppercase">
            {data.chapter}
          </p>
          <h2
            id="case-hood-title"
            className="m-0 max-w-[40rem] font-display text-[1.375rem] font-semibold text-atlas-ink tablet:text-[1.5rem] desktop:text-[1.625rem]"
          >
            {data.title}
          </h2>
        </div>

        <div className="flex flex-col gap-10 desktop:flex-row desktop:items-start desktop:gap-14">
          {data.diagramSrc && data.diagramWidth && data.diagramHeight ? (
            <div className="relative h-[220px] w-full shrink-0 overflow-hidden bg-atlas-ink-blue tablet:h-[280px] desktop:h-[340px] desktop:w-[560px]">
              <Image
                src={data.diagramSrc}
                alt={data.diagramLabel}
                width={data.diagramWidth}
                height={data.diagramHeight}
                sizes="(min-width: 1440px) 560px, 100vw"
                className="h-full w-full object-cover object-top opacity-80"
              />
              <p className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center font-mono text-[12px] text-white">
                {data.diagramLabel}
              </p>
            </div>
          ) : (
            <div
              className="flex h-[220px] w-full shrink-0 items-center justify-center bg-atlas-ink-blue px-8 tablet:h-[280px] desktop:h-[340px] desktop:w-[560px]"
              role="img"
              aria-label={data.diagramLabel}
            >
              <p className="m-0 max-w-[25rem] text-center font-mono text-[12px] text-white">
                {data.diagramLabel}
              </p>
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {data.items.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <p className="m-0 font-mono text-[11px] tracking-[0.04em] text-atlas-label uppercase">
                  {item.label}
                </p>
                <p className="m-0 max-w-[28.75rem] font-sans text-sm leading-[1.5] text-atlas-body">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
