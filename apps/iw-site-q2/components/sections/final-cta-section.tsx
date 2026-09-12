import { SectionReveal } from "@/components/motion/section-reveal";
import { Btn } from "@/components/primitives";
import { systemsCallUrl } from "@/lib/site";

/** Final CTA palette — neutral deep background, no blue overlay tint */
const DEEP = "#03070c";
const PANEL = "#03070c";
const TEXT_PRIMARY = "#ffffff";

export function FinalCTASection() {
  return (
    <section
      id="systems-call"
      aria-labelledby="final-cta-heading"
      style={{
        backgroundColor: DEEP,
        isolation: "isolate",
      }}
      className="relative z-[2] w-full"
    >
      <div className="container max-w-[1200px] px-4 py-12 sm:px-5 sm:py-16 lg:py-20">
        <div
          className="relative overflow-hidden"
          style={{
            backgroundColor: PANEL,
          }}
        >
          <div className="relative z-10 flex w-full max-w-[640px] flex-col justify-center px-8 py-14 lg:px-14 lg:py-20 xl:px-16">
            <SectionReveal>
              <header>
                <h2
                  id="final-cta-heading"
                  className="m-0 font-bold tracking-tight"
                  style={{
                    fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                    fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)",
                    lineHeight: 1.18,
                    color: TEXT_PRIMARY,
                    fontWeight: 700,
                  }}
                >
                  Tell us what you’re working on.
                </h2>
                <p
                  className="m-0 mt-5"
                  style={{
                    fontSize: "clamp(1rem, 1.05vw, 1.0625rem)",
                    lineHeight: 1.65,
                    color: "#c8d1da",
                    maxWidth: "36rem",
                  }}
                >
                  A new build, something that needs fixing, or software that needs to change.
                </p>
              </header>
            </SectionReveal>

            <div className="mt-8">
              <Btn variant="primary" href={systemsCallUrl}>
                Start a Conversation
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
