import { ContactForm } from "@/components/sections/contact-form";
import type { ContactFixture } from "@/content/contact";

type ContactMainProps = {
  data: ContactFixture;
};

/**
 * Story-First contact — split invitation (rust→gold) + paper form panel.
 */
export function ContactMain({ data }: ContactMainProps) {
  return (
    <section
      aria-labelledby="contact-page-title"
      className="min-h-[calc(100dvh-var(--atlas-nav-h))]"
    >
      <div className="mx-auto grid max-w-[var(--atlas-page)] desktop:grid-cols-[minmax(0,35rem)_minmax(0,1fr)]">
        <aside className="flex flex-col justify-between bg-gradient-to-br from-atlas-rust to-atlas-gold px-6 py-14 text-white tablet:px-10 tablet:py-16 desktop:min-h-[46rem] desktop:px-16 desktop:py-[7.5rem]">
          <div className="flex max-w-[27.5rem] flex-col gap-5">
            <h1
              id="contact-page-title"
              className="m-0 font-display text-[2rem] leading-tight font-semibold tablet:text-[2.5rem] desktop:text-[2.75rem]"
            >
              {data.title}
            </h1>
            <p className="m-0 font-sans text-[15px] leading-relaxed text-white/90 tablet:text-base">
              {data.body}
            </p>
            <div className="mt-4 flex flex-col gap-6">
              {data.panels.map((panel) => (
                <div key={panel.label}>
                  <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-cream uppercase">
                    {panel.label}
                  </p>
                  <p className="mt-2 mb-0 font-sans text-sm leading-[22px] text-white/85">
                    {panel.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="bg-atlas-paper px-6 py-14 tablet:px-10 tablet:py-16 desktop:px-16 desktop:py-[7.5rem]">
          <ContactForm data={data} />
        </div>
      </div>
    </section>
  );
}
