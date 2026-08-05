import type { CSSProperties } from "react";

const grad: CSSProperties = {
  background: "linear-gradient(180deg, #e8edf5 0%, #5c6574 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

type Size = "nav" | "footer" | "compact";

const fontPx: Record<Size, string | number> = {
  /** Nav / inline brand */
  nav: 26,
  /** Hero footer band */
  footer: "clamp(3.5rem, 12vw, 7.5rem)",
  /** Footer small row */
  compact: 16,
};

/**
 * Wordmark: **IntraWeb** (silver→charcoal gradient) + **.** (brand orange).
 * Matches the provided IntraWeb. mark; use PNG in public only if you add a file.
 */
export function IntraWebWordmark({
  size = "nav",
  as: El = "span",
  className = "",
  style = {},
  id,
}: {
  size?: Size;
  as?: "span" | "div" | "p";
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  return (
    <El
      id={id}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontFamily: "var(--font-dm-sans), var(--iw-display), sans-serif",
        fontWeight: 800,
        fontSize: fontPx[size],
        lineHeight: 1.05,
        letterSpacing: "-0.04em",
        userSelect: "none",
        ...style,
      }}
    >
      <span style={grad}>IntraWeb</span>
      <span style={{ color: "var(--iw-amber)" }} aria-hidden>
        .
      </span>
    </El>
  );
}
