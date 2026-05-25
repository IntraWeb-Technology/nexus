import Link from "next/link";
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
const ACCENT = "#ff8c00";
const SUBTEXT = "#888888";

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
        {/* Section top — faded horizontal (decorative, not a full rule) */}
        <div className="mb-6 md:mb-8" style={{ height: 1, background: fadeX }} aria-hidden />

        <div className="md:grid md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:items-start md:gap-0 lg:grid-cols-[minmax(0,268px)_minmax(0,1fr)]">
          <SectionReveal>
            <div className="relative mb-5 md:mb-0 md:pr-7 lg:pr-8">
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
                  fontSize: "clamp(1rem, 1.15vw, 1.125rem)",
                  lineHeight: 1.2,
                  fontWeight: 700,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "0.055em",
                  margin: "0 0 8px",
                }}
              >
                The friction we see every day
              </h2>
              <p
                className="mb-5 md:mb-7"
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: SUBTEXT,
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                Different companies. Same patterns.
              </p>
              <Link
                href="/#proof"
                className="hidden md:inline-block"
                style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}
              >
                See all friction patterns →
              </Link>
            </div>
          </SectionReveal>

          <FrictionGridMotion />
        </div>

        <Link href="/#proof" className="md:hidden" style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>
          See all friction patterns →
        </Link>
      </div>

      <div aria-hidden style={{ height: 1, backgroundImage: SECTION_GRADIENT_SEAM }} />
    </section>
  );
}
