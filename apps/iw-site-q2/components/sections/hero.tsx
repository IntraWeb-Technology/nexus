"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeroDiagram } from "@/components/hero-diagram";
import { Btn, Eyebrow, Reveal, StatusDot } from "@/components/primitives";
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
    <section
      ref={heroRef}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingTop: 140,
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
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
        }}
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
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
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
          <span className="section-marker">[ 01 — HERO ]</span>
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
              background: "rgba(16,26,46,0.5)",
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
            <Reveal>
              <Eyebrow n="02">AI systems for SMB operations</Eyebrow>
            </Reveal>

            <Reveal delay={120}>
              <h1
                style={{
                  fontSize: "clamp(40px, 6vw, 84px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.035em",
                  fontWeight: 700,
                  marginTop: 28,
                  marginBottom: 36,
                }}
              >
                <span style={{ display: "block", color: "var(--iw-fg)" }}>
                  Your business runs on manual work.
                </span>
                <span
                  style={{
                    display: "block",
                    background:
                      "linear-gradient(100deg, var(--iw-fg-2) 0%, var(--iw-fg-2) 30%, var(--iw-fg-3) 60%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  It doesn&apos;t have to.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p
                style={{
                  fontSize: 19,
                  lineHeight: 1.55,
                  maxWidth: 520,
                  color: "var(--iw-fg-1)",
                  marginBottom: 24,
                }}
              >
                IntraWeb builds AI-powered web systems, workflow automation, and intelligent
                integrations for small and mid-sized businesses, so you can stop doing the work your
                systems should be doing.
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Btn variant="primary" href="/diagnostic">
                  Start with a Free Diagnostic
                </Btn>
                <Btn variant="secondary" href="#services-overview" icon={false}>
                  <Ic.arrowDown width={14} height={14} /> <span>See What We Build</span>
                </Btn>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <p
                className="mono"
                style={{
                  marginTop: 20,
                  fontSize: 12,
                  color: "var(--iw-fg-2)",
                  maxWidth: 560,
                  lineHeight: 1.55,
                  letterSpacing: "0.04em",
                }}
              >
                No sales pitch. A structured audit of where AI and automation can cut your operational
                load, with a clear roadmap you keep.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div
                className="hero-metrics"
                style={{
                  marginTop: 48,
                  borderTop: "1px solid var(--iw-hairline)",
                  paddingTop: 24,
                }}
              >
                {[
                  ["2–3 wk", "Diagnostic"],
                  ["From $7.5K", "Roadmap you own"],
                  ["NJ · Remote", "NY metro + nationwide"],
                ].map(([v, l], i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: "var(--iw-display)",
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
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
            </Reveal>
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
