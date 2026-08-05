"use client";

import { Btn, Reveal } from "@/components/primitives";
import { SectionLabel } from "@/components/section-label";
import { Ic } from "@/components/icons";

const cards = [
  {
    title: "AI & Automation",
    headline: "Automate what drains you",
    body: "Lead intake. Client onboarding. Proposal delivery. Invoice collection. Reporting. We map your highest-friction processes and replace manual work with intelligent, monitored workflows.",
    icon: Ic.sparkles,
  },
  {
    title: "Web & Product",
    headline: "Build systems that convert and scale",
    body: "From foundational SMB websites to SaaS-grade platforms — engineered for performance, built with integrations in mind, and structured with a clear upgrade path from day one.",
    icon: Ic.code,
  },
  {
    title: "AI Integration",
    headline: "Bring AI into your existing product",
    body: "Whether you need a mid-level assistant workflow or a production-grade AI architecture, we integrate models, guardrails, and data pipelines into what you already have.",
    icon: Ic.shield,
  },
];

export function ServicesOverviewSection() {
  return (
    <section id="services-overview" className="marketing-slab">
      <div className="container">
        <Reveal>
          <SectionLabel>What we build</SectionLabel>
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
            Three disciplines. One studio.
          </h2>
        </Reveal>

        <div className="services-three" style={{ marginTop: 56 }}>
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.title} delay={i * 90}>
                <div
                  className="card"
                  style={{
                    padding: 32,
                    minHeight: 360,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 4,
                      border: "1px solid var(--iw-hairline)",
                      display: "grid",
                      placeItems: "center",
                      color: "var(--accent)",
                      marginBottom: 24,
                    }}
                  >
                    <Icon width={22} height={22} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--iw-fg-3)", letterSpacing: "0.2em" }}>
                    {c.title.toUpperCase()}
                  </div>
                  <h3
                    style={{
                      marginTop: 12,
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                    }}
                  >
                    {c.headline}
                  </h3>
                  <p style={{ marginTop: 14, fontSize: 16, color: "var(--iw-fg-1)", lineHeight: 1.7, flex: 1 }}>{c.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
            <Btn variant="secondary" href="/services">
              View Full Services
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
