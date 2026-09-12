"use client";

import Link from "next/link";
import { Btn, HeroRise } from "@/components/primitives";
import { MOTION_HERO } from "@/lib/motion-tokens";
import { systemsCallUrl } from "@/lib/site";

const { y, durationMs, staggerMs } = MOTION_HERO;

export function HomeHeroCopy() {
  return (
    <div style={{ maxWidth: "min(640px, 100%)", paddingBottom: "0.5rem" }}>
      <HeroRise delay={0} duration={durationMs} y={y}>
        <p
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          Senior-led software engineering
        </p>
      </HeroRise>
      <HeroRise delay={staggerMs} duration={durationMs} y={y}>
        <h1
          id="home-hero-heading"
          style={{
            fontSize: "clamp(2rem, 4.2vw, 3.05rem)",
            lineHeight: 1.12,
            fontWeight: 650,
            color: "var(--iw-fg)",
            marginBottom: "1.25rem",
          }}
        >
          Software engineering for systems that have to work in production.
        </h1>
      </HeroRise>
      <HeroRise delay={staggerMs * 2} duration={durationMs} y={y}>
        <p
          style={{
            fontSize: "clamp(1rem, 1.15vw, 1.125rem)",
            lineHeight: 1.65,
            color: "var(--iw-fg-1)",
            marginBottom: "2rem",
          }}
        >
          We build, integrate, modernize, and stabilize production software.
        </p>
      </HeroRise>
      <HeroRise delay={staggerMs * 3} duration={durationMs} y={y}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "14px 20px",
          }}
        >
          <Btn variant="primary" href={systemsCallUrl}>
            Start a Conversation
          </Btn>
          <Link
            href="/#proof"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            See the Work <span aria-hidden>↓</span>
          </Link>
        </div>
      </HeroRise>
    </div>
  );
}
