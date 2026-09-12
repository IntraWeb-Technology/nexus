import { SectionReveal } from "@/components/motion/section-reveal";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

const ACCENT = "#ff8c00";

const ENTRY_POINTS = [
  "A defined build.",
  "A problem that needs investigation.",
  "A system that needs stabilizing.",
  "Ongoing engineering support.",
] as const;

export function ModelSection() {
  return (
    <section
      id="model"
      aria-labelledby="model-heading"
      style={{
        position: "relative",
        paddingTop: 0,
        paddingBottom: 0,
        background: "#0a0a0a",
      }}
    >
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="max-w-3xl">
          <SectionReveal>
            <h2
              id="model-heading"
              style={{
                fontSize: "clamp(1.45rem, 2.4vw, 2rem)",
                lineHeight: 1.15,
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "1.35rem",
                letterSpacing: "-0.02em",
              }}
            >
              Start where the work actually is.
            </h2>
          </SectionReveal>

          <ul
            className="m-0 flex list-none flex-col gap-3 p-0 sm:gap-3.5"
            style={{ marginBottom: "1.75rem" }}
          >
            {ENTRY_POINTS.map((line, i) => (
              <li
                key={line}
                className="flex items-start gap-3"
                style={{
                  paddingLeft: i === 1 ? "0.5rem" : i === 2 ? "0.25rem" : i === 3 ? "0.75rem" : 0,
                }}
              >
                <span
                  aria-hidden
                  className="mt-[0.65em] h-px w-5 shrink-0"
                  style={{ background: i % 2 === 0 ? ACCENT : "rgba(141,154,167,0.55)" }}
                />
                <span
                  style={{
                    fontSize: "clamp(1.05rem, 1.25vw, 1.2rem)",
                    lineHeight: 1.45,
                    fontWeight: 500,
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {line}
                </span>
              </li>
            ))}
          </ul>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.65,
              fontWeight: 400,
              color: "rgba(180,180,180,0.96)",
              margin: 0,
              maxWidth: "36rem",
            }}
          >
            The first step depends on what the work requires.
          </p>
        </div>
      </div>

      <div
        aria-hidden
        style={{
          height: 1,
          backgroundImage: SECTION_GRADIENT_SEAM,
        }}
      />
    </section>
  );
}
