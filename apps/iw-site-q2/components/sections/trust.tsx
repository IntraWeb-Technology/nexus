"use client";

import Link from "next/link";
import { Eyebrow, Reveal } from "@/components/primitives";

const proof = [
  "15+ years senior frontend and full-stack engineering",
  "AI and automation stack: n8n, Claude API, OpenAI, ElevenLabs, HubSpot, Stripe",
  "NJ-based, available for on-site engagements in the NY metro area",
  "Ongoing retainer support for every system we build",
];

export function TrustSection() {
  return (
    <section id="trust" style={{ padding: "140px 0", position: "relative" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48 }}>
          <span className="section-marker">[ 08 — TRUST ]</span>
          <span className="section-marker">{"// built for serious operators"}</span>
        </div>

        <div className="trust-grid">
          <Reveal>
            <Eyebrow>Built for people who are serious about it</Eyebrow>
            <h2
              style={{
                fontSize: "clamp(36px, 4.5vw, 60px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                fontWeight: 700,
                marginTop: 20,
              }}
            >
              We work with founders and operators, not committees.
            </h2>
            <p style={{ fontSize: 18, color: "var(--iw-fg-1)", marginTop: 24, lineHeight: 1.6 }}>
              IntraWeb is a boutique studio. That means you work directly with senior engineering and AI
              architecture expertise, not an account manager passing your brief to an offshore team.
            </p>
            <p style={{ fontSize: 18, color: "var(--iw-fg-2)", marginTop: 16, lineHeight: 1.6 }}>
              We take fewer clients and go deeper. Every engagement is scoped, documented, and designed to
              outlast us.
            </p>
            <p style={{ marginTop: 28, fontSize: 15, color: "var(--iw-fg-2)" }}>
              Want the longer story?{" "}
              <Link href="/about" style={{ color: "var(--accent)" }}>
                Read About →
              </Link>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div
              style={{
                padding: 28,
                borderRadius: "var(--r-md)",
                border: "1px solid var(--iw-hairline)",
                background: "rgba(16,26,46,0.45)",
              }}
            >
              <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.2em", marginBottom: 16 }}>
                PROOF POINTS
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {proof.map((x) => (
                  <li key={x} style={{ fontSize: 15, color: "var(--iw-fg-1)", lineHeight: 1.55 }}>
                    {x}
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
