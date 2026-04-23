"use client";

import { Btn, Reveal } from "@/components/primitives";
import { SectionLabel } from "@/components/section-label";
import { Ic } from "@/components/icons";

const included = [
  "Full operational process audit",
  "AI and automation opportunity map",
  "Risk and integration assessment",
  "Prioritized implementation roadmap",
  "Written deliverable you keep, regardless of what you do next",
];

export function DiagnosticSection() {
  return (
    <section id="diagnostic" className="marketing-slab">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap" }}>
          <span className="section-marker">[ 05 — THE LOWEST-RISK FIRST STEP ]</span>
        </div>

        <div className="diagnostic-grid">
          <Reveal>
            <div style={{ maxWidth: 640, marginBottom: 8 }}>
              <SectionLabel>The lowest-risk first step</SectionLabel>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 3vw, 2.3rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontWeight: 700,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              Not sure where to start?
              <br />
              Start with a Diagnostic.
            </h2>
            <p style={{ fontSize: 16, color: "var(--iw-fg-1)", marginTop: 24, lineHeight: 1.7 }}>
              Most engagements begin here. The AI Workflow Diagnostic is a structured assessment of your current
              operations — where time is lost, where AI fits, and what a realistic automation roadmap looks like for your
              business.
            </p>
            <p style={{ fontSize: 16, color: "var(--iw-fg-1)", marginTop: 16, lineHeight: 1.7 }}>
              You leave with a prioritized document you own. No fluff, no sales deck — just a clear picture of
              what&apos;s possible and what it costs to act on it.
            </p>
            <div style={{ marginTop: 32 }}>
              <Btn variant="primary" href="/diagnostic">
                Book Your Diagnostic
              </Btn>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              className="card"
              style={{
                padding: 24,
                borderRadius: 12,
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.2em", marginBottom: 16 }}
              >
                WHAT YOU GET
              </div>
              <ul
                style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}
              >
                {included.map((line) => (
                  <li
                    key={line}
                    style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 16, color: "var(--iw-fg-1)" }}
                  >
                    <Ic.check width={16} height={16} style={{ color: "var(--color-accent)", marginTop: 3, flexShrink: 0 }} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
