import { SectionReveal } from "@/components/motion/section-reveal";
import { FrictionGridMotion } from "@/components/sections/friction-grid-motion";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

/** Snapshot styling — deep field + decorative fades (not a closed grid). */
const FRICTION_BG = "#0a0a0a";
/** Top → bottom: flat #0a0a0a at seam (matches hero floor), then cool depth — no orange/warm wash. */
const FRICTION_BG_GRADIENT = [
  "linear-gradient(180deg, transparent 0%, transparent 52%, rgba(36, 56, 74, 0.32) 100%)",
  "linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 32%, #090a0e 52%, #070708 78%, #050506 100%)",
].join(", ");
const LINE = "#30363d";

const fadeY = `linear-gradient(to bottom, transparent 0%, ${LINE} 14%, ${LINE} 86%, transparent 100%)`;
const fadeX = `linear-gradient(to right, transparent 0%, ${LINE} 12%, ${LINE} 88%, transparent 100%)`;

export function FrictionSection() {
  return (
    <section
      id="friction"
      aria-labelledby="friction-heading"
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: FRICTION_BG,
        backgroundImage: FRICTION_BG_GRADIENT,
      }}
    >
      <div className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
        <div className="mb-6 md:mb-8" style={{ height: 1, background: fadeX }} aria-hidden />

        <div className="md:grid md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:items-start md:gap-0 lg:grid-cols-[minmax(0,248px)_minmax(0,1fr)]">
          <SectionReveal>
            <div className="relative mb-6 md:mb-0 md:pr-7 lg:pr-8">
              <div
                className="hidden md:block"
                aria-hidden
                style={{
                  position: "absolute",
                  top: "2%",
                  bottom: "2%",
                  right: 0,
                  width: 1,
                  background: fadeY,
                }}
              />
              <h2
                id="friction-heading"
                style={{
                  fontSize: "clamp(1.25rem, 2vw, 1.65rem)",
                  lineHeight: 1.25,
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  maxWidth: "14ch",
                }}
              >
                When the software gets in the way.
              </h2>
            </div>
          </SectionReveal>

          <div className="md:pl-8 lg:pl-10">
            <FrictionGridMotion />
          </div>
        </div>
      </div>

      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </section>
  );
}
