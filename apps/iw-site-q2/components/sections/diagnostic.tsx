"use client";

import { Btn, Eyebrow, Reveal } from "@/components/primitives";
import { Ic } from "@/components/icons";

const included = [
  "Full operational process audit",
  "AI and automation opportunity map",
  "Risk and integration assessment",
  "Prioritized implementation roadmap",
  "Fixed-fee, no ongoing commitment required",
];

export function DiagnosticSection() {
  return (
    <section id="diagnostic" style={{ padding: "140px 0", position: "relative" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48 }}>
          <span className="section-marker">[ 05 — THE LOWEST-RISK FIRST STEP ]</span>
          <span className="section-marker">{"// diagnostic"}</span>
        </div>

        <div className="diagnostic-grid">
          <Reveal>
            <Eyebrow>The lowest-risk first step</Eyebrow>
            <h2
              style={{
                fontSize: "clamp(36px, 4.5vw, 60px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                fontWeight: 700,
                marginTop: 20,
              }}
            >
              Not sure where to start?
              <br />
              Start with a Diagnostic.
            </h2>
            <p style={{ fontSize: 18, color: "var(--iw-fg-1)", marginTop: 24, lineHeight: 1.65 }}>
              Most engagements begin here. The AI Workflow Diagnostic is a structured assessment of your
              current operations: where time is lost, where AI fits, and what a realistic automation roadmap
              looks like for your business.
            </p>
            <p style={{ fontSize: 18, color: "var(--iw-fg-2)", marginTop: 16, lineHeight: 1.65 }}>
              You leave with a prioritized document you own. No fluff, no sales deck, just a clear picture
              of what is possible and what it costs.
            </p>
            <div style={{ marginTop: 32 }}>
              <Btn variant="primary" href="/diagnostic">
                Book Your Diagnostic
              </Btn>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              style={{
                padding: 36,
                borderRadius: "var(--r-md)",
                border: "1px solid var(--iw-hairline)",
                background: "linear-gradient(180deg, rgba(16,26,46,0.75), rgba(10,18,34,0.75))",
              }}
            >
              <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.2em", marginBottom: 16 }}>
                WHAT YOU GET
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {included.map((line) => (
                  <li key={line} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 15, color: "var(--iw-fg-1)" }}>
                    <Ic.check width={16} height={16} style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: "1px solid var(--iw-hairline)",
                  fontSize: 14,
                  color: "var(--iw-fg-2)",
                  lineHeight: 1.6,
                }}
              >
                <span className="mono" style={{ color: "var(--iw-fg)", letterSpacing: "0.12em" }}>
                  Standard Diagnostic — $7,500
                </span>
                <br />
                <span className="mono" style={{ color: "var(--iw-fg-1)", letterSpacing: "0.08em" }}>
                  Premium Diagnostic — $12,000 (multi-team, complex systems)
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
