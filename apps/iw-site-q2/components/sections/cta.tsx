"use client";

import { Btn, Eyebrow, Reveal } from "@/components/primitives";
import { scheduleUrl } from "@/lib/site";

export function CtaSection() {
  return (
    <section id="cta" style={{ padding: "140px 0", position: "relative" }}>
      <div className="container">
        <div
          style={{
            position: "relative",
            padding: "96px 64px",
            background:
              "linear-gradient(135deg, rgba(52,231,208,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(255,161,85,0.08) 100%)",
            border: "1px solid rgba(52,231,208,0.25)",
            borderRadius: "var(--r-lg)",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -150,
              left: -150,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(52,231,208,0.25), transparent 60%)",
              filter: "blur(40px)",
              animation: "orb-float 10s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -150,
              right: -150,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,161,85,0.22), transparent 60%)",
              filter: "blur(40px)",
              animation: "orb-float 12s ease-in-out infinite reverse",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "linear-gradient(rgba(147,197,253,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.05) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />

          <div style={{ position: "relative" }}>
            <Reveal>
              <Eyebrow>Ready when you are</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2
                style={{
                  fontSize: "clamp(40px, 5vw, 72px)",
                  fontWeight: 700,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.05,
                  marginTop: 20,
                  marginBottom: 16,
                }}
              >
                Ready to stop doing the work
                <br />
                your systems should do?
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p style={{ fontSize: 19, color: "var(--iw-fg-1)", maxWidth: 640, margin: "0 auto 36px", lineHeight: 1.55 }}>
                Start with a free 30-minute discovery call. No commitment, no deck, just an honest conversation
                about where automation can actually move the needle for your business.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn variant="primary" href={scheduleUrl}>
                  Schedule a Call
                </Btn>
                <Btn variant="secondary" href="/diagnostic" icon={false}>
                  Start with a Diagnostic
                </Btn>
              </div>
            </Reveal>
            <Reveal delay={260}>
              <div className="mono" style={{ marginTop: 36, fontSize: 11, color: "var(--iw-fg-2)", letterSpacing: "0.15em" }}>
                LIMITED ENGAGEMENTS · WE RESPOND WITHIN ONE BUSINESS DAY
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
