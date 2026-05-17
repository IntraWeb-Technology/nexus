import { HeroDiagram } from "@/components/hero-diagram";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

const FIT_INDICATORS = [
  "Teams of 20–150 people",
  "Operations, Finance, RevOps, or technology leaders",
  "Companies with workflow friction across multiple systems",
  "Organizations ready to fix root causes, not symptoms",
] as const;

const WHERE_STARTS = [
  "Reporting depends on manual assembly",
  "Client handoffs live across email, Slack, and memory",
  "Follow-up ownership changes before action happens",
  "Teams rely on workarounds because systems do not connect",
] as const;

/** Matches Proof section (`proof-section.tsx`) */
const SECTION_BG = "#0a0a0a";
const SECTION_SURFACE = [
  "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(36, 56, 74, 0.18) 100%)",
  "linear-gradient(180deg, #0c0d10 0%, #0a0a0a 38%, #070707 72%, #030303 88%, #000000 100%)",
].join(", ");

export function FitSection() {
  return (
    <section
      id="fit"
      aria-labelledby="fit-heading"
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: SECTION_BG,
        backgroundImage: SECTION_SURFACE,
      }}
    >
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <h2 id="fit-heading" className="sr-only">
          Who we work with
        </h2>

        <div className="flex flex-col gap-0 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start">
          {/* Text column */}
          <div
            className="order-1 flex flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:order-1 lg:max-w-none lg:px-10 lg:pb-12 lg:pt-0"
          >
            <header className="flex flex-col gap-5">
              <p
                className="m-0 flex items-center gap-3"
                style={{
                  fontSize: "clamp(0.75rem, 0.9vw, 0.8125rem)",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                <span aria-hidden className="h-3 w-0.5 shrink-0 rounded-[1px]" style={{ background: "var(--accent)" }} />
                Who we work with
              </p>
              <h3
                className="m-0 max-w-xl"
                style={{
                  fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                  fontSize: "clamp(1.65rem, 2.8vw, 2.35rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "#ffffff",
                }}
              >
                Teams scaling faster than their operations can keep up.
              </h3>
              <p
                className="m-0 max-w-xl"
                style={{
                  fontSize: "clamp(1rem, 1.15vw, 1.0625rem)",
                  lineHeight: 1.65,
                  color: "var(--iw-fg-2)",
                }}
              >
                We work with organizations where growth has exposed dependency, rework, slow handoffs, and fragmented systems.
              </p>
            </header>

            <div>
              <p
                className="m-0 mb-3"
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--iw-fg-3)",
                }}
              >
                Fit indicators
              </p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:gap-3">
                {FIT_INDICATORS.map((text) => (
                  <li key={text} className="flex items-start gap-3 py-0.5 sm:py-1">
                    <span
                      aria-hidden
                      className="mt-2 h-px w-6 shrink-0"
                      style={{ background: "var(--accent)" }}
                    />
                    <span style={{ fontSize: 15, lineHeight: 1.55, color: "var(--iw-fg-1)" }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="mt-1 px-5 py-6 sm:px-6 sm:py-7"
              style={{
                background: "var(--iw-panel)",
              }}
            >
              <h4
                className="m-0 mb-4 flex items-center gap-3"
                style={{
                  fontSize: "clamp(1rem, 1.15vw, 1.125rem)",
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  color: "var(--iw-fg-1)",
                }}
              >
                <span aria-hidden className="h-4 w-0.5 shrink-0 rounded-[1px]" style={{ background: "var(--accent)" }} />
                Where this usually starts
              </h4>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {WHERE_STARTS.map((text) => (
                  <li
                    key={text}
                    className="relative pl-4"
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "var(--iw-fg-3)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full"
                      style={{ background: "var(--iw-fg-3)" }}
                    />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Animated workflow diagram (same component as hero) */}
          <div
            className="relative order-2 w-full lg:order-2"
            style={{
              paddingTop: 20,
              paddingBottom: 28,
            }}
          >
            <div className="relative mx-auto w-full max-w-[720px]">
              <HeroDiagram intensity={0.9} />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </section>
  );
}
