"use client";

import { Reveal, Counter, usePrefersReducedMotion } from "@/components/primitives";
import { SectionLabel } from "@/components/section-label";

function StatBig({
  index,
  children,
  label,
}: {
  index: number;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
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
        {String(index + 1).padStart(2, "0")}
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
            fontSize: "clamp(36px, 4vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--iw-fg)",
          }}
        >
          {children}
        </div>
        <div style={{ marginTop: 12, fontSize: 15, color: "var(--iw-fg-2)", lineHeight: 1.5 }}>{label}</div>
      </div>
    </div>
  );
}

export function ProblemSection() {
  const reduce = usePrefersReducedMotion();

  const s0 = { k: 0, label: "the average ROI of an unmanaged AI integration after 90 days" };
  const s1 = { n: 68, label: "of SMB automation projects fail at the handoff stage" };
  const s2 = { n: 3, label: "faster operations when AI is built around your real workflows" };

  return (
    <section id="problem" className="marketing-slab marketing-slab--continue">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 8 }}>
          <span className="section-marker">[ 02 — THE PROBLEM ]</span>
        </div>

        <Reveal>
          <div style={{ maxWidth: 800, marginBottom: 24 }}>
            <SectionLabel>Why most AI investments fail</SectionLabel>
          </div>
          <h2
            style={{
              fontSize: "clamp(1.9rem, 3.2vw, 2.4rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: 1100,
              fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
            }}
          >
            95% of AI pilots never deliver ROI.
          </h2>
        </Reveal>

        <div className="problem-grid" style={{ marginTop: 48, gap: "clamp(2rem, 4vw, 3rem)" }}>
          <Reveal delay={80}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 16, color: "var(--iw-fg-1)", lineHeight: 1.7 }}>
                Not because AI doesn&apos;t work. Because it gets bolted onto broken processes, handed off without a
                plan, and left unmaintained after launch.
              </p>
              <p style={{ fontSize: 16, color: "var(--iw-fg-1)", lineHeight: 1.7 }}>
                We&apos;ve seen it repeatedly — businesses spending heavily on an AI tool that nobody uses six months
                later, or automations that save two hours but create four new failure points.
              </p>
              <p style={{ fontSize: 16, color: "var(--iw-fg-1)", lineHeight: 1.7 }}>
                IntraWeb takes a different approach. We diagnose before we build. We architect before we automate. And
                we stay in your stack after launch through retainer coverage that actually maintains the systems you
                paid for.
              </p>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div
              className="card"
              style={{
                display: "grid",
                gap: 0,
                overflow: "hidden",
                padding: 0,
                borderRadius: 12,
              }}
            >
              <StatBig index={0} label={s0.label}>
                {reduce || s0.k === 0 ? (
                  <>
                    <span style={{ color: "var(--color-accent)" }}>$</span>0
                  </>
                ) : (
                  <>
                    <span style={{ color: "var(--color-accent)" }}>$</span>
                    <Counter to={0} duration={1200} decimals={0} />
                  </>
                )}
              </StatBig>
              <div style={{ height: 1, background: "var(--iw-hairline)" }} />
              <StatBig index={1} label={s1.label}>
                <span style={{ color: "var(--color-accent)" }}>
                  <Counter to={68} suffix="%" duration={1200} />
                </span>
              </StatBig>
              <div style={{ height: 1, background: "var(--iw-hairline)" }} />
              <StatBig index={2} label={s2.label}>
                <span style={{ color: "var(--color-accent)" }}>
                  <Counter to={3} suffix="x" duration={1200} />
                </span>
              </StatBig>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
