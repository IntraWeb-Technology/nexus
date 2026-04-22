"use client";

import { Eyebrow, Reveal } from "@/components/primitives";

export function ProblemSection() {
  const stats = [
    {
      k: "$0",
      label: "the average ROI of an unmanaged AI integration after 90 days",
    },
    {
      k: "68%",
      label: "of SMB automation projects fail at the handoff stage",
    },
    {
      k: "3x",
      label: "faster operations when AI is built around your real workflows",
    },
  ];

  return (
    <section id="problem" style={{ padding: "140px 0", position: "relative" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48 }}>
          <span className="section-marker">[ 02 — THE PROBLEM ]</span>
          <span className="section-marker">{"// why most AI investments fail"}</span>
        </div>

        <Reveal>
          <Eyebrow>Why most AI investments fail</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(36px, 4.5vw, 64px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              fontWeight: 700,
              marginTop: 24,
              maxWidth: 1100,
            }}
          >
            95% of AI pilots never deliver ROI.
          </h2>
        </Reveal>

        <div className="problem-grid" style={{ marginTop: 48 }}>
          <Reveal delay={80}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 18, color: "var(--iw-fg-1)", lineHeight: 1.65 }}>
                Not because AI doesn&apos;t work. Because it gets bolted onto broken processes, handed
                off without a plan, and left unmaintained after launch.
              </p>
              <p style={{ fontSize: 18, color: "var(--iw-fg-2)", lineHeight: 1.65 }}>
                We&apos;ve seen it repeatedly: businesses spending $20K on an AI tool that nobody uses
                six months later, or automations that save two hours but create four new failure points.
              </p>
              <p style={{ fontSize: 18, color: "var(--iw-fg-1)", lineHeight: 1.65 }}>
                IntraWeb takes a different approach. We diagnose before we build. We architect before
                we automate. And we stay in your stack after launch through retainer coverage that
                actually maintains the systems you paid for.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div
              style={{
                display: "grid",
                gap: 1,
                background: "var(--iw-hairline)",
                border: "1px solid var(--iw-hairline)",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
              }}
            >
              {stats.map((s, i) => (
                <div
                  key={s.k}
                  style={{
                    padding: "28px 24px",
                    background: "var(--iw-void)",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 20,
                    alignItems: "start",
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--iw-fg-3)",
                      paddingTop: 6,
                      letterSpacing: "0.18em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--iw-display)",
                        fontSize: "clamp(36px, 4vw, 52px)",
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                        background: "linear-gradient(180deg, var(--iw-fg) 0%, var(--accent) 120%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {s.k}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 15, color: "var(--iw-fg-2)", lineHeight: 1.5 }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
