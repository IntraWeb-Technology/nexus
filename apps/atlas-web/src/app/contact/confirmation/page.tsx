import type { Metadata } from "next";
import Link from "next/link";
import {
  atlasStoryPrimaryButtonClassName,
  atlasStorySecondaryButtonClassName,
} from "@/components/editorial/atlas-button";
import { contactConfirmationContent } from "@/content/resilience";

export const metadata: Metadata = {
  title: contactConfirmationContent.seo.title,
  description: contactConfirmationContent.seo.description,
  robots: { index: false, follow: false },
};

/**
 * Contact confirmation — Story-First split invitation + next-steps panel
 * (Figma 691:2 / 691:62 / 691:113).
 */
export default function ContactConfirmationPage() {
  const data = contactConfirmationContent;

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section
        aria-labelledby="contact-confirmation-title"
        className="border-b border-atlas-border"
      >
        <div className="mx-auto grid max-w-[var(--atlas-page)] desktop:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
          <div
            className="atlas-pad-x flex flex-col gap-4 py-12 text-white tablet:gap-7 tablet:py-16 desktop:py-[7.5rem]"
            style={{
              backgroundImage:
                "linear-gradient(107deg, rgb(179, 82, 50) 4%, rgb(191, 146, 62) 79%)",
            }}
          >
            <h1
              id="contact-confirmation-title"
              className="m-0 max-w-[27.5rem] font-display text-[1.6875rem] leading-tight font-semibold tablet:text-[2.75rem]"
            >
              {data.title}
            </h1>
            <p className="m-0 max-w-[26.25rem] font-sans text-sm leading-[1.55] tablet:text-base">
              {data.body}
            </p>
          </div>

          <div className="atlas-pad-x flex flex-col gap-8 bg-atlas-paper py-10 tablet:gap-10 tablet:py-16 desktop:py-[7.5rem]">
            {data.panels.map((panel) => (
              <div key={panel.label} className="max-w-[32.5rem]">
                <p className="m-0 font-sans text-[11px] font-medium tracking-[0.08em] text-atlas-umber uppercase">
                  {panel.label}
                </p>
                <p className="mt-2 mb-0 font-sans text-sm leading-[1.5] text-atlas-umber tablet:text-[15px]">
                  {panel.body}
                </p>
              </div>
            ))}
            <div className="flex flex-col gap-3 pt-2 tablet:flex-row tablet:flex-wrap">
              <Link
                href={data.primary.href}
                className={`${atlasStoryPrimaryButtonClassName} w-full justify-center tablet:w-auto`}
              >
                {data.primary.label}
              </Link>
              <Link
                href={data.secondary.href}
                className={`${atlasStorySecondaryButtonClassName} w-full justify-center tablet:w-auto`}
              >
                {data.secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
