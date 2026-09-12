import type { CSSProperties } from "react";
import { ProofArtifactAppear } from "@/components/motion/proof-artifact-appear";
import { SectionReveal } from "@/components/motion/section-reveal";
import { SECTION_GRADIENT_SEAM } from "@/lib/section-seam";

const SECTION_BG = "#0a0a0a";
const PROOF_ACCENT = "#ff8c00";

/** Bottom eases to pure black so the band meets Engagement (`--iw-bg-deep`) without a seam. */
const SURFACE = [
  "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(36, 56, 74, 0.18) 100%)",
  "linear-gradient(180deg, #0c0d10 0%, #0a0a0a 38%, #070707 72%, #030303 88%, #000000 100%)",
].join(", ");

const DIVIDER = "1px solid rgba(255,255,255,0.09)";

type ProofRecord = {
  title: string;
  needed: string;
  tookOn: string;
  changed: string;
};

/**
 * Delivery evidence only — claims verified against repository implementation.
 * Shared Content Platform wording is architecture-scoped (not live CMS cutover).
 */
const RECORDS: ProofRecord[] = [
  {
    title: "Client Delivery Platform",
    needed: "Project progress, messages, documents, billing, and change requests needed one delivery surface.",
    tookOn: "Built separate client and staff experiences around shared project and delivery data.",
    changed:
      "Delivery work now has one authenticated place for progress, documents, communication, billing, and scope changes.",
  },
  {
    title: "Intake & Scheduling",
    needed: "New inquiries needed a defined path into follow-up.",
    tookOn: "Built the intake flow from website submission into CRM, email, and scheduling.",
    changed: "A submitted inquiry now moves into a defined follow-up path instead of ending at the form.",
  },
  {
    title: "Shared Content Platform",
    needed: "Two websites needed shared content infrastructure without mixing their content.",
    tookOn:
      "Built one Strapi content platform with explicit separation between sites and frontend integrations on both properties.",
    changed:
      "Both sites can share the same content platform architecture while keeping their content boundaries separate.",
  },
];

function layerLabel(): CSSProperties {
  return {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: PROOF_ACCENT,
    margin: "0 0 8px",
  };
}

function DeliveryRecord({ title, needed, tookOn, changed, index }: ProofRecord & { index: number }) {
  const padX = "1.2rem";
  const asymmetric =
    index === 1
      ? { borderRadius: 0, borderStyle: "solid" as const }
      : index === 2
        ? { borderRadius: 8, borderStyle: "dashed" as const }
        : { borderRadius: 8, borderStyle: "solid" as const };

  return (
    <article
      style={{
        border: `1px ${asymmetric.borderStyle} rgba(255,255,255,0.1)`,
        background: index === 1 ? "#0e1014" : "#121212",
        borderRadius: asymmetric.borderRadius,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ padding: `1.25rem ${padX} 1.1rem` }}>
        <h3
          style={{
            margin: 0,
            fontSize: "clamp(1.05rem, 1.2vw, 1.2rem)",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.3,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h3>
      </div>

      <div style={{ borderTop: DIVIDER, padding: `14px ${padX} 16px` }}>
        <p style={layerLabel()}>What needed attention</p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "rgba(212,212,212,0.95)" }}>{needed}</p>
      </div>

      <div style={{ borderTop: DIVIDER, padding: `14px ${padX} 16px` }}>
        <p style={layerLabel()}>What we took on</p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "rgba(212,212,212,0.95)" }}>{tookOn}</p>
      </div>

      <div
        style={{
          marginTop: "auto",
          borderTop: DIVIDER,
          background: "#0a0a0a",
          padding: `14px ${padX} 1.25rem`,
        }}
      >
        <p style={layerLabel()}>What changed</p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#ffffff", fontWeight: 500 }}>{changed}</p>
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
                Selected work
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
                What changed.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.65,
                  fontWeight: 400,
                  color: "rgba(163,163,163,0.98)",
                  marginBottom: 0,
                }}
              >
                What needed attention, what we took on, and what was different afterward.
              </p>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 gap-5 md:gap-4 xl:grid-cols-3">
            {RECORDS.map((record, i) => (
              <ProofArtifactAppear key={record.title} index={i}>
                <DeliveryRecord {...record} index={i} />
              </ProofArtifactAppear>
            ))}
          </div>
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
