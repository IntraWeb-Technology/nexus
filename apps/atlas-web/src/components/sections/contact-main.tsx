import { ChapterMarker } from "@/components/editorial/chapter-marker";
import { ContactForm } from "@/components/sections/contact-form";
import type { ContactFixture } from "@/content/contact";

type ContactMainProps = {
  data: ContactFixture;
};

export function ContactMain({ data }: ContactMainProps) {
  return (
    <section
      aria-labelledby="contact-page-title"
      className="mx-auto max-w-[var(--atlas-page)]"
    >
      <div className="atlas-pad-x flex flex-col gap-6 py-14 tablet:gap-7 tablet:py-20 desktop:gap-7 desktop:py-[7.5rem]">
        <ChapterMarker>{data.chapter}</ChapterMarker>
        <h1
          id="contact-page-title"
          className="m-0 max-w-[45rem] font-display text-[2rem] leading-tight font-semibold text-atlas-ink tablet:text-[2.75rem] tablet:leading-[52px] desktop:text-[2.75rem]"
        >
          {data.title}
        </h1>
        <p className="m-0 max-w-[35rem] font-sans text-[15px] leading-7 text-atlas-body tablet:text-[17px]">
          {data.body}
        </p>

        <div className="flex flex-col gap-12 desktop:flex-row desktop:items-start desktop:gap-[6.25rem]">
          <ContactForm data={data} />

          <aside className="flex w-full max-w-[28.75rem] flex-col gap-8 desktop:pt-1">
            {data.panels.map((panel, i) => (
              <div
                key={panel.label}
                className={
                  i > 0 ? "border-t border-atlas-border pt-8" : undefined
                }
              >
                <p className="m-0 font-mono text-[11px] tracking-[0.08em] text-atlas-sage uppercase">
                  {panel.label}
                </p>
                <p className="mt-2.5 mb-0 font-sans text-sm leading-[22px] text-atlas-body">
                  {panel.body}
                </p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
