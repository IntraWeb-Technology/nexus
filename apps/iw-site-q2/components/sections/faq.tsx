"use client";

import { useState } from "react";
import { Eyebrow, Reveal } from "@/components/primitives";
import { Ic } from "@/components/icons";

const items = [
  {
    q: "What is the Diagnostic?",
    a: "The AI Workflow Diagnostic is a structured engagement (not a generic discovery call) that maps your operations, identifies where automation delivers value, and produces a prioritized roadmap you own. Standard is $7,500; Premium is $12,000 for multi-team or complex systems.",
  },
  {
    q: "How long does implementation take?",
    a: "After the Diagnostic, implementation scope depends on the roadmap. Many builds run on a retainer so we can ship iteratively, harden integrations, and keep systems maintained. We will give you a realistic timeline before work starts.",
  },
  {
    q: "Who is IntraWeb right for?",
    a: "Founders and operators at SMBs who want production outcomes: fewer manual handoffs, better instrumentation, and AI where it actually earns its keep. Not a fit if you want a one-hour consultation or instant execution without planning.",
  },
  {
    q: "What sets you apart from consultants or dev shops?",
    a: "We focus on implementation and operational rollout, not only recommendations. Engagements include workflow build, deployment, exception handling, and the option for ongoing retainer coverage so systems keep working after launch.",
  },
  {
    q: "How do I get started?",
    a: "Use the contact form or book a call. We respond within one business day with a next step, or an honest answer if we are not the right fit.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" style={{ padding: "140px 0", position: "relative" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 48 }}>
          <span className="section-marker">[ 09 — FAQ ]</span>
          <span className="section-marker">{"// 05 entries"}</span>
        </div>

        <div className="faq-grid">
          <Reveal>
            <div style={{ position: "sticky", top: 100 }}>
              <Eyebrow>FAQ</Eyebrow>
              <h2
                style={{
                  fontSize: "clamp(36px, 4.5vw, 60px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  fontWeight: 700,
                  marginTop: 20,
                }}
              >
                Common questions.
              </h2>
              <p style={{ fontSize: 16, color: "var(--iw-fg-2)", marginTop: 20, maxWidth: 360 }}>
                Still have one? Reach out. We respond within one business day.
              </p>
            </div>
          </Reveal>

          <div>
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={it.q} delay={i * 40}>
                  <div style={{ borderTop: "1px solid var(--iw-hairline)" }}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        color: "inherit",
                        cursor: "pointer",
                        padding: "28px 0",
                        display: "grid",
                        gridTemplateColumns: "40px 1fr 32px",
                        gap: 20,
                        alignItems: "center",
                      }}
                    >
                      <span className="mono" style={{ fontSize: 11, color: "var(--iw-fg-3)", letterSpacing: "0.18em" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--iw-display)",
                          fontSize: 20,
                          fontWeight: 600,
                          letterSpacing: "-0.015em",
                        }}
                      >
                        {it.q}
                      </span>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          border: "1px solid var(--iw-hairline)",
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          color: isOpen ? "var(--accent)" : "var(--iw-fg-1)",
                          borderColor: isOpen ? "var(--accent)" : "var(--iw-hairline)",
                          transition: "all 300ms",
                        }}
                      >
                        {isOpen ? <Ic.minus width={14} height={14} /> : <Ic.plus width={14} height={14} />}
                      </span>
                    </button>
                    <div
                      style={{
                        overflow: "hidden",
                        maxHeight: isOpen ? 320 : 0,
                        opacity: isOpen ? 1 : 0,
                        transition: "max-height 400ms var(--ease), opacity 300ms",
                      }}
                    >
                      <div
                        style={{
                          padding: "0 0 32px 60px",
                          fontSize: 16,
                          color: "var(--iw-fg-1)",
                          lineHeight: 1.65,
                          maxWidth: 720,
                        }}
                      >
                        {it.a}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            <div style={{ borderTop: "1px solid var(--iw-hairline)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
