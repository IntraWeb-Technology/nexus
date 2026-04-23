"use client";

import { Counter, Reveal } from "@/components/primitives";

type StatRow =
  | {
      type: "counter";
      n: number;
      suffix: string;
      decimals?: number;
      label: string;
      source: string;
      highlight?: "amber";
    }
  | { type: "text"; text: string; label: string; source: string };

const stats: StatRow[] = [
  {
    type: "counter",
    n: 95,
    suffix: "%",
    label: "AI pilots that fail to deliver ROI",
    source: "common industry pattern",
    highlight: "amber",
  },
  {
    type: "counter",
    n: 68,
    suffix: "%",
    label: "of SMB automation projects fail at handoff",
    source: "ops reality, not hype",
  },
  { type: "text", text: "3×", label: "faster operations when AI fits real workflows", source: "when done intentionally" },
  {
    type: "counter",
    n: 99.98,
    suffix: "%",
    decimals: 2,
    label: "uptime target on deployed flows",
    source: "how we engineer handoffs",
  },
];

export function StatsSection() {
  return (
    <section
      id="stats"
      className="marketing-slab"
      style={{
        position: "relative",
        borderTop: "1px solid var(--iw-hairline)",
        borderBottom: "1px solid var(--iw-hairline)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(52,231,208,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <span className="section-marker">[ 07 — BY THE NUMBERS ]</span>
          <span className="section-marker">{"// instrumented"}</span>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div
                style={{
                  padding: "40px 32px",
                  background: "var(--iw-void)",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <div className="mono" style={{ fontSize: 10, color: "var(--iw-fg-3)", letterSpacing: "0.2em" }}>
                  {String(i + 1).padStart(2, "0")} / 04
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--iw-display)",
                      fontSize: "clamp(52px, 5.5vw, 88px)",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      background:
                        s.type === "counter" && s.highlight === "amber"
                          ? "linear-gradient(180deg, var(--iw-amber) 0%, var(--iw-amber-hot) 100%)"
                          : "linear-gradient(180deg, var(--iw-fg) 0%, var(--accent) 120%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {s.type === "text" ? (
                      s.text
                    ) : (
                      <Counter to={s.n} suffix={s.suffix} decimals={s.decimals ?? 0} />
                    )}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 14, color: "var(--iw-fg-1)", lineHeight: 1.4 }}>{s.label}</div>
                  <div className="mono" style={{ marginTop: 8, fontSize: 10, color: "var(--iw-fg-3)", letterSpacing: "0.15em" }}>
                    {s.source}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
