"use client";

import Link from "next/link";
import { Reveal } from "@/components/primitives";
import { SectionLabel } from "@/components/section-label";

const proof = [
  "15+ years senior frontend and full-stack engineering",
  "AI and automation systems deployed across lead intake, onboarding, document generation, and client communication",
  "NJ-based, available for on-site engagements in the NY metro area",
  "Ongoing retainer support for every system we build",
];

export function TrustSection() {
  return (
    <section id="trust" className="marketing-slab">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap" }}>
          <span className="section-marker">[ 08 — TRUST ]</span>
        </div>

        <div className="trust-grid" style={{ gap: "clamp(2rem, 4vw, 3rem)" }}>
          <Reveal>
            <div style={{ marginBottom: 12 }}>
              <SectionLabel>Built for people who are serious about it</SectionLabel>
            </div>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 3vw, 2.2rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                fontWeight: 700,
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
              }}
            >
              We work with founders and operators, not committees.
            </h2>
            <p style={{ fontSize: 16, color: "var(--iw-fg-1)", marginTop: 24, lineHeight: 1.7 }}>
              IntraWeb is a boutique studio. That means you work directly with senior engineering and AI architecture
              expertise — not an account manager passing your brief to an offshore team.
            </p>
            <p style={{ fontSize: 16, color: "var(--iw-fg-1)", marginTop: 16, lineHeight: 1.7 }}>
              We take fewer clients and go deeper. Every engagement is scoped, documented, and designed to outlast us.
            </p>
            <p style={{ marginTop: 28, fontSize: 16, color: "var(--iw-fg-1)" }}>
              Want the longer story?{" "}
              <Link href="/about" style={{ color: "var(--color-accent)" }}>
                Read the IntraWeb about page →
              </Link>
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div
              className="card"
              style={{
                padding: 24,
                borderRadius: 12,
                background: "var(--page-bg-elevated-dark)",
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--color-accent)", letterSpacing: "0.2em", marginBottom: 16 }}
              >
                PROOF POINTS
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {proof.map((x) => (
                  <li key={x} style={{ fontSize: 16, color: "var(--iw-fg-1)", lineHeight: 1.6 }}>
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
