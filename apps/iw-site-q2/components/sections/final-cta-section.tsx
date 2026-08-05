import Image from "next/image";
import Link from "next/link";
import { Calendar, ListChecks, MessageCircle } from "lucide-react";
import { SectionReveal } from "@/components/motion/section-reveal";
import { Btn } from "@/components/primitives";
import { systemsCallUrl } from "@/lib/site";

/** Final CTA palette — neutral deep background, no blue overlay tint */
const DEEP = "#03070c";
const PANEL = "#03070c";
const ORANGE = "var(--accent)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_MUTED = "#8d9aa7";

const AUDIT_IMAGE = "/operational-audit-material.png";

const EXPECTATIONS = [
  {
    title: "No sales pitch",
    body: "This is a working session, not a pitch.",
    Icon: Calendar,
  },
  {
    title: "Strategic conversation",
    body: "We’ll understand your context and key challenges.",
    Icon: MessageCircle,
  },
  {
    title: "Clarity on next steps",
    body: "You’ll leave with a clear view of what to focus on.",
    Icon: ListChecks,
  },
] as const;

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
          className="relative overflow-hidden lg:flex lg:min-h-[520px]"
          style={{
            backgroundColor: PANEL,
          }}
        >
          <div className="relative z-10 flex w-full flex-[0_0_auto] flex-col justify-center px-8 py-14 lg:w-[46%] lg:max-w-none lg:px-14 lg:py-20 xl:w-[47%] xl:px-16">
            <SectionReveal>
              <header className="max-w-[620px]">
                <p
                  className="m-0 mb-5 flex items-center gap-3"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: ORANGE,
                  }}
                >
                  <span aria-hidden className="h-px w-8 shrink-0 rounded-full" style={{ background: ORANGE }} />
                  NEXT STEP
                </p>
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
                  Operational clarity starts with understanding where friction actually lives.
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
                  We’ll map your operational reality and identify the infrastructure that creates clarity, velocity,
                  and scale.
                </p>
              </header>
            </SectionReveal>

            <div className="mt-8 flex max-w-[620px] flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Btn variant="primary" href={systemsCallUrl}>
                Book a Systems Call
              </Btn>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center gap-1 text-[15px] font-semibold text-[var(--accent)] transition-colors hover:text-[var(--iw-orange-soft)] sm:w-auto sm:justify-start sm:px-2"
              >
                What to expect →
              </Link>
            </div>

            <ul className="m-0 mt-10 flex max-w-[620px] list-none flex-col gap-0 p-0">
              {EXPECTATIONS.map(({ title, body, Icon }) => (
                <li
                  key={title}
                  className="flex gap-4 border-t py-5 first:border-t-0 first:pt-0 lg:py-6"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <span className="mt-0.5 shrink-0" aria-hidden style={{ color: ORANGE }}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 font-semibold" style={{ color: TEXT_PRIMARY, fontSize: "1rem" }}>
                      {title}
                    </p>
                    <p className="m-0 mt-1.5 text-[15px] leading-relaxed" style={{ color: TEXT_MUTED }}>
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: neutral overlay + mask feather the image without shifting it blue. */}
          <div className="relative min-h-[220px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:w-[54%] lg:min-h-0 xl:w-[53%]">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={AUDIT_IMAGE}
                alt="Operational audit materials showing workflow maps, notes, and process documents"
                fill
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover opacity-100 scale-[1.06] lg:scale-[1.1]"
                style={{
                  filter: "brightness(0.86) contrast(1.04) saturate(0.95)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 12%, black 28%, black 88%, rgba(0,0,0,0.5) 96%, transparent 100%)",
                  objectPosition: "65% center",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 12%, black 28%, black 88%, rgba(0,0,0,0.5) 96%, transparent 100%)",
                }}
                priority={false}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, #03070c 0%, rgba(3,7,12,0.92) 13%, rgba(3,7,12,0.44) 36%, transparent 68%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, #03070c 0%, rgba(3,7,12,0.52) 15%, transparent 42%, rgba(3,7,12,0.34) 100%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 68% 46%, transparent 0%, rgba(3,7,12,0.12) 42%, rgba(3,7,12,0.72) 100%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to left, #03070c 0%, rgba(3,7,12,0.72) 6%, transparent 18%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
