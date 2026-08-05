"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePrefersReducedMotion, HeroRise } from "@/components/primitives";

export function PageHero({
  label,
  title,
  subhead,
  minHeight = true,
  align = "left",
  children,
}: {
  label?: string;
  title: ReactNode;
  subhead?: ReactNode;
  minHeight?: boolean;
  /** Center title + subhead (and label) for marketing heroes */
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const reduce = usePrefersReducedMotion();
  const d0 = label ? 100 : 0;
  const d1 = label ? 200 : 100;
  const d2 = label ? 300 : 200;
  const isCenter = align === "center";
  const copyAlign: CSSProperties = isCenter
    ? { textAlign: "center" as const, marginLeft: "auto", marginRight: "auto" }
    : {};

  return (
    <header className={minHeight ? "page-hero page-hero--tall" : "page-hero"}>
      <div
        className="page-hero__bg page-hero__drift"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.35,
        }}
      />
      <div
        className="container"
        style={{ position: "relative", zIndex: 2, textAlign: isCenter ? "center" : "inherit" }}
      >
        {label && !reduce && (
          <HeroRise delay={0} duration={500}>
            <p
              className="section-label section-label--accent"
              style={{
                fontFamily: "var(--iw-body)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                margin: 0,
                marginBottom: 20,
                ...copyAlign,
              }}
            >
              {label}
            </p>
          </HeroRise>
        )}
        {label && reduce && (
          <p
            className="section-label section-label--accent"
            style={{
              fontFamily: "var(--iw-body)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              margin: 0,
              marginBottom: 20,
              ...copyAlign,
            }}
          >
            {label}
          </p>
        )}

        {!reduce ? (
          <>
            <HeroRise delay={d0} duration={500}>
              <h1
                style={{
                  fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                  fontSize: "clamp(2rem, 4.5vw, 3rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "var(--iw-fg)",
                  maxWidth: 900,
                  ...copyAlign,
                }}
              >
                {title}
              </h1>
            </HeroRise>
            {subhead && (
              <HeroRise delay={d1} duration={500}>
                <p
                  style={{
                    fontFamily: "var(--iw-body)",
                    fontSize: "clamp(1.05rem, 1.2vw, 1.2rem)",
                    lineHeight: 1.7,
                    color: "var(--iw-fg-1)",
                    maxWidth: 720,
                    marginTop: 20,
                    marginBottom: 0,
                    ...copyAlign,
                  }}
                >
                  {subhead}
                </p>
              </HeroRise>
            )}
            {children && <HeroRise delay={d2}>{children}</HeroRise>}
          </>
        ) : (
          <>
            <h1
              style={{
                fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--iw-fg)",
                maxWidth: 900,
                ...copyAlign,
              }}
            >
              {title}
            </h1>
            {subhead && (
              <p
                style={{
                  fontFamily: "var(--iw-body)",
                  fontSize: "clamp(1.05rem, 1.2vw, 1.2rem)",
                  lineHeight: 1.7,
                  color: "var(--iw-fg-1)",
                  maxWidth: 720,
                  marginTop: 20,
                  ...copyAlign,
                }}
              >
                {subhead}
              </p>
            )}
            {children}
          </>
        )}
      </div>
    </header>
  );
}
