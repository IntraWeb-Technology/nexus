import type { LucideIcon } from "lucide-react";
import { BarChart3, CircleCheck, Clock, FileCheck, TrendingUp, UserRound } from "lucide-react";
import type { CSSProperties } from "react";
import { ProofArtifactAppear } from "@/components/motion/proof-artifact-appear";
import { SectionReveal } from "@/components/motion/section-reveal";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

const SECTION_BG = "#0a0a0a";
const CARD_BG = "#121212";
const IMPACT_BG = "#0a0a0a";
const PROOF_ACCENT = "#ff8c00";

/** Bottom eases to pure black so the band meets Our Model (`--iw-bg-deep`) without a seam. */
const SURFACE = [
  "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(36, 56, 74, 0.18) 100%)",
  "linear-gradient(180deg, #0c0d10 0%, #0a0a0a 38%, #070707 72%, #030303 88%, #000000 100%)",
].join(", ");

const DIVIDER = "1px solid rgba(255,255,255,0.09)";

function eyebrowStyle(accent: string): CSSProperties {
  return {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: accent,
    margin: "0 0 12px",
  };
}

function Artifact({
  title,
  summary,
  bullets,
  icon: Icon,
  impactValue,
  impactLabel,
  impactIcon: ImpactIcon,
}: {
  title: string;
  summary: string;
  bullets: string[];
  icon: LucideIcon;
  impactValue: string;
  impactLabel: string;
  impactIcon: LucideIcon;
}) {
  const accent = PROOF_ACCENT;
  const padX = "1.15rem";
  const padBottom = "1.25rem";

  return (
    <article
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        background: CARD_BG,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Top segment — icon + title + summary (centered) */}
      <div style={{ padding: `1.25rem ${padX} 1.1rem`, textAlign: "center" }}>
        <Icon
          aria-hidden
          width={28}
          height={28}
          strokeWidth={1.35}
          style={{ color: accent, display: "block", margin: "0 auto 14px" }}
        />
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 15,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "clamp(0.9rem, 0.95vw, 1rem)",
            fontWeight: 400,
            lineHeight: 1.55,
            color: "rgba(212,212,212,0.95)",
          }}
        >
          {summary}
        </p>
      </div>

      <div style={{ borderTop: DIVIDER, padding: `16px ${padX} 18px` }}>
        <p style={eyebrowStyle(accent)}>What changed</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {bullets.map((b) => (
            <li
              key={b}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginBottom: 10,
                fontSize: 14,
                lineHeight: 1.5,
                color: "#ffffff",
                textAlign: "left",
              }}
            >
              <CircleCheck
                aria-hidden
                width={18}
                height={18}
                strokeWidth={2}
                style={{ color: accent, flexShrink: 0, marginTop: 2 }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Impact — darker strip (centered) */}
      <div
        style={{
          marginTop: "auto",
          borderTop: DIVIDER,
          background: IMPACT_BG,
          padding: `16px ${padX} ${padBottom}`,
          textAlign: "center",
        }}
      >
        <p style={{ ...eyebrowStyle(accent), textAlign: "center" }}>Impact</p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px 12px",
          }}
        >
          <ImpactIcon aria-hidden width={24} height={24} strokeWidth={1.35} style={{ color: accent }} />
          <span
            style={{
              fontSize: "clamp(2rem, 3.5vw, 2.45rem)",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {impactValue}
          </span>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(163,163,163,0.98)",
            margin: "12px 0 0",
            lineHeight: 1.45,
            textAlign: "center",
          }}
        >
          {impactLabel}
        </p>
      </div>
    </article>
  );
}

export function ProofSection() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-heading"
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: SECTION_BG,
        backgroundImage: SURFACE,
      }}
    >
      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-x-12 xl:gap-x-14 lg:items-start">
          <SectionReveal>
            <div className="lg:sticky lg:top-28" style={{ alignSelf: "start" }}>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: PROOF_ACCENT,
                  fontWeight: 600,
                  marginBottom: "0.65rem",
                }}
              >
                What changed
              </p>
              <h2
                id="proof-heading"
                style={{
                  fontSize: "clamp(1.45rem, 2.4vw, 2rem)",
                  lineHeight: 1.12,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "0.85rem",
                }}
              >
                Real environments.
                <br />
                Real changes.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.65,
                  fontWeight: 400,
                  color: "rgba(163,163,163,0.98)",
                  marginBottom: "1.15rem",
                }}
              >
                Pattern recognition without implementation consequence is analysis. Here is what changed.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 gap-5 md:gap-4 xl:grid-cols-3">
            <ProofArtifactAppear index={0}>
            <Artifact
              icon={FileCheck}
              title="Request to Fulfillment"
              summary="5 handoffs eliminated. Cycle time reduced from 9 days to 48 hours."
              impactValue="94%"
              impactLabel="faster cycle time"
              impactIcon={Clock}
              bullets={[
                "Ownership changes 5 times",
                "Information re-entered in 3 systems",
                "Manual checks create 2-3 day delays",
                "No visibility until customer follows up",
              ]}
            />
            </ProofArtifactAppear>

            <ProofArtifactAppear index={1}>
            <Artifact
              icon={BarChart3}
              title="Monthly Reporting"
              summary="Report cycle reduced from 12 days to 2 days. Manual work eliminated."
              impactValue="83%"
              impactLabel="faster reporting cycle"
              impactIcon={Clock}
              bullets={[
                "Depends on one person",
                "Multiple manual data pulls",
                "Rework due to inconsistent data",
                "Stakeholders wait without visibility",
              ]}
            />
            </ProofArtifactAppear>

            <ProofArtifactAppear index={2}>
            <Artifact
              icon={UserRound}
              title="Onboarding Process"
              summary="Steps reduced from 18 to 7. New hire ramp improved by 60%."
              impactValue="60%"
              impactLabel="faster ramp time"
              impactIcon={TrendingUp}
              bullets={[
                "Too many systems to touch",
                "Work gets lost between teams",
                "New hires wait on access",
                "No consistent onboarding experience",
              ]}
            />
            </ProofArtifactAppear>
          </div>
        </div>
      </div>

      {/* Gradient seam → next section */}
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
