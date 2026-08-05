"use client";

import { useState } from "react";
import { Eyebrow, Reveal } from "@/components/primitives";
import { Ic } from "@/components/icons";

const steps = [
  {
    n: "01",
    phase: "DIAGNOSTIC",
    dur: "2–3 weeks",
    title: "Map, identify, prioritize.",
    desc: "We map your workflows, identify where automation makes sense, and build a prioritized roadmap. No commitment to ongoing work. If we are not the right fit, we will tell you.",
    bullets: ["Workflow audit", "ROI scoring per process", "Prioritized roadmap", "Go/no-go decision"],
  },
  {
    n: "02",
    phase: "IMPLEMENTATION",
    dur: "Scoped + retainer",
    title: "Build, integrate, deploy.",
    desc: "We build and deploy the workflows: agent integrations, automation sequences, exception handling. Hands-on, not advisory.",
    bullets: ["Agent orchestration", "System integrations", "Exception handling", "Production deployment"],
  },
  {
    n: "03",
    phase: "OPTIMIZATION",
    dur: "ongoing",
    title: "Monitor, tune, extend.",
    desc: "Systems drift. We monitor, tune, and extend as your operations evolve, so your automations keep paying off.",
    bullets: ["Performance monitoring", "Drift detection", "Iteration cycles", "Capability expansion"],
  },
];

export function ProcessSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="process" className="marketing-slab">
      <div className="container">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(36px, 4.5vw, 64px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              fontWeight: 700,
              marginTop: 20,
              maxWidth: 900,
            }}
          >
            Diagnostic first. Then we build. Then we stay.
          </h2>
        </Reveal>

        <div className="process-grid" style={{ marginTop: 72, gap: 80 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 40,
                bottom: 40,
                width: 1,
                background: "var(--iw-hairline)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 40,
                width: 1,
                height: `${active * 33.33 + 16}%`,
                background: "linear-gradient(180deg, var(--accent), transparent)",
                transition: "height 600ms var(--ease)",
              }}
            />

            {steps.map((s, i) => (
              <button
                key={s.n}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                style={{
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "24px 0 24px 70px",
                  position: "relative",
                  borderBottom: "1px solid var(--iw-hairline)",
                  opacity: active === i ? 1 : 0.5,
                  transition: "opacity 300ms",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 22,
                    width: 34,
                    height: 34,
                    border: "1px solid",
                    borderColor: active === i ? "var(--accent)" : "var(--iw-hairline)",
                    background: "var(--iw-void)",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--iw-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: active === i ? "var(--accent)" : "var(--iw-fg-2)",
                    transition: "all 300ms",
                    boxShadow: active === i ? "0 0 0 6px rgba(52,231,208,0.1)" : "none",
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--iw-fg-3)",
                    letterSpacing: "0.2em",
                    marginBottom: 6,
                  }}
                >
                  {s.phase} · {s.dur}
                </div>
                <div
                  style={{
                    fontFamily: "var(--iw-display)",
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.title}
                </div>
              </button>
            ))}
          </div>

          <div style={{ position: "sticky", top: 100, alignSelf: "start" }}>
            <div
              style={{
                position: "relative",
                padding: 40,
                background: "linear-gradient(180deg, var(--iw-abyss) 0%, rgba(10,18,34,0.3) 100%)",
                border: "1px solid var(--iw-hairline)",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
                }}
              />

              <div key={active} style={{ animation: "reveal-up 500ms var(--ease-out)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.2em" }}>
                    PHASE {steps[active].n}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "var(--iw-hairline)" }} />
                  <span className="mono" style={{ fontSize: 11, color: "var(--iw-fg-3)" }}>
                    {steps[active].dur}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    marginBottom: 20,
                  }}
                >
                  {steps[active].title}
                </h3>

                <p style={{ fontSize: 16, color: "var(--iw-fg-1)", marginBottom: 32, lineHeight: 1.65 }}>
                  {steps[active].desc}
                </p>

                <div className="process-bullets" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {steps[active].bullets.map((b) => (
                    <div
                      key={b}
                      style={{
                        padding: "12px 14px",
                        border: "1px solid var(--iw-hairline)",
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        background: "rgba(16,26,46,0.4)",
                      }}
                    >
                      <Ic.check width={14} height={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
