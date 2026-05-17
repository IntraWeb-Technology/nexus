"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeroDiagram } from "@/components/hero-diagram";
import { Btn, HeroRise, StatusDot, Reveal } from "@/components/primitives";
import { SectionLabel } from "@/components/section-label";
import { Ic } from "@/components/icons";

export function Hero({ intensity = 1 }: { intensity?: number }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (intensity === 0) return;
    const onMove = (e: PointerEvent) => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = heroRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setMouse({
          x: (e.clientX - r.left) / r.width,
          y: (e.clientY - r.top) / r.height,
        });
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [intensity]);

  return (
    <section ref={heroRef} id="hero" className="home-hero">
      <div
        className="page-hero__bg page-hero__drift"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          zIndex: 0,
        }}
        aria-hidden
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
          radial-gradient(500px 500px at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(52,231,208,0.18), transparent 60%),
          radial-gradient(600px 400px at ${(1 - mouse.x) * 100}% ${mouse.y * 100}%, rgba(255,161,85,0.10), transparent 60%)
        `,
          transition: "background 200ms linear",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "60%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.25), transparent 65%)",
          filter: "blur(40px)",
          animation: "orb-float 12s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
        data-orb-float
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,231,208,0.18), transparent 65%)",
          filter: "blur(40px)",
          animation: "orb-float 14s ease-in-out infinite reverse",
          pointerEvents: "none",
          zIndex: 0,
        }}
        data-orb-float
      />

      <div
        className="page-hero__drift"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.5,
          backgroundImage:
            "linear-gradient(rgba(147,197,253,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Link
            href="/diagnostic"
            className="mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 11,
              color: "var(--iw-fg-1)",
              padding: "8px 14px",
              border: "1px solid var(--iw-hairline)",
              borderRadius: 999,
              background: "rgba(30,37,53,0.65)",
              backdropFilter: "blur(10px)",
            }}
          >
            <StatusDot color="var(--iw-amber)" size={5} />
            <span style={{ letterSpacing: "0.12em" }}>Q2 2026 · Diagnostic slots open</span>
            <Ic.arrow width={12} height={12} />
          </Link>
        </div>

        <div className="hero-grid">
          <div>
            <HeroRise delay={0} duration={500}>
              <SectionLabel>AI systems for SMB operations</SectionLabel>
            </HeroRise>

            <HeroRise delay={0} duration={500} y={20}>
              <h1
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.035em",
                  fontWeight: 700,
                  marginTop: 24,
                  marginBottom: 28,
                  fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                }}
              >
                <span style={{ display: "block", color: "var(--iw-fg)" }}>
                  Your business runs on manual work.
                </span>
                <span
                  style={{
                    display: "block",
                    color: "var(--iw-fg-2)",
                  }}
                >
                  It doesn&apos;t have to.
                </span>
              </h1>
            </HeroRise>

            <HeroRise delay={100} duration={500} y={20}>
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  maxWidth: 560,
                  color: "var(--iw-fg-1)",
                  marginBottom: 24,
                }}
              >
                IntraWeb builds AI-powered web systems, workflow automation, and intelligent integrations for
                small and mid-sized businesses — so you can stop doing the work your systems should be doing.
              </p>
            </HeroRise>

            <HeroRise delay={200} duration={500} y={20}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Btn variant="primary" href="/diagnostic">
                  Start with a Free Diagnostic
                </Btn>
                <Btn variant="secondary" href="#services-overview" icon={false}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    See What We Build <span aria-hidden>↓</span>
                  </span>
                </Btn>
              </div>
            </HeroRise>

            <HeroRise delay={300} duration={500} y={20}>
              <div
                className="hero-metrics"
                style={{
                  marginTop: 40,
                  borderTop: "1px solid var(--iw-hairline)",
                  paddingTop: 24,
                }}
              >
                {[
                  ["2–3 wk", "Typical diagnostic"],
                  ["Yours to keep", "Written roadmap"],
                  ["NJ · Remote", "NY metro + nationwide"],
                ].map(([v, l], i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: "var(--iw-fg)",
                      }}
                    >
                      {v}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: "var(--iw-fg-2)",
                        marginTop: 4,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </HeroRise>
          </div>

          <Reveal delay={200}>
            <div style={{ position: "relative" }}>
              <HeroDiagram intensity={intensity} />
            </div>
          </Reveal>
        </div>

        <div
          style={{
            marginTop: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--iw-mono)",
            fontSize: 11,
            color: "var(--iw-fg-3)",
          }}
        >
          <div style={{ width: 40, height: 1, background: "var(--iw-hairline)" }} />
          <span>Scroll to explore</span>
          <Ic.arrowDown width={14} height={14} />
        </div>
      </div>
    </section>
  );
}
