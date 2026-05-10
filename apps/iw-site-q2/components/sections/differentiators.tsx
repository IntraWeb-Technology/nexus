"use client";

import { Eyebrow, Reveal } from "@/components/primitives";
import { Ic } from "@/components/icons";

const cols = [
  {
    label: "Consultancies",
    accent: false,
    items: [
      "Strategy deck, then disappear",
      "Recommend tools, don't build",
      "PowerPoint over production",
      "Scale via junior headcount",
    ],
  },
  {
    label: "Dev shops",
    accent: false,
    items: [
      "Build code, ignore operations",
      "Requirements-out, outcomes-unclear",
      "No post-launch ownership",
      "One-size-fits-all delivery",
    ],
  },
  {
    label: "IntraWeb",
    accent: true,
    items: [
      "Implementation first, always",
      "Build + deploy + stay",
      "Tool-agnostic, outcome-focused",
      "Senior operators, small team",
    ],
  },
];

export function DifferentiatorsSection() {
  return (
    <section id="differentiators" className="marketing-slab">
      <div className="container">
        <Reveal>
          <Eyebrow>Positioning</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(36px, 4.5vw, 64px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              fontWeight: 700,
              marginTop: 20,
              maxWidth: 1000,
            }}
          >
            Not a consultancy.
            <br />
            Not a dev shop.
            <br />
            <span
              style={{
                background: "linear-gradient(95deg, var(--accent), var(--iw-amber))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              The implementation layer.
            </span>
          </h2>
        </Reveal>

        <div className="diff-grid" style={{ marginTop: 72 }}>
          {cols.map((c, i) => (
            <Reveal key={c.label} delay={i * 100}>
              <div
                style={{
                  position: "relative",
                  padding: 32,
                  background: c.accent
                    ? "linear-gradient(180deg, rgba(52,231,208,0.08) 0%, rgba(255,161,85,0.04) 100%)"
                    : "rgba(16,26,46,0.4)",
                  border: "1px solid",
                  borderColor: c.accent ? "rgba(52,231,208,0.3)" : "var(--iw-hairline)",
                  borderRadius: "var(--r-md)",
                  minHeight: 380,
                  overflow: "hidden",
                }}
              >
                {c.accent && (
                  <div
                    style={{
                      position: "absolute",
                      top: -80,
                      right: -80,
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(52,231,208,0.3), transparent 70%)",
                      filter: "blur(30px)",
                    }}
                  />
                )}
                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
                  {c.accent ? (
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        background: "var(--accent)",
                        boxShadow: "0 0 12px var(--accent)",
                      }}
                    />
                  ) : (
                    <Ic.x width={14} height={14} style={{ color: "var(--iw-fg-3)" }} />
                  )}
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: c.accent ? "var(--accent)" : "var(--iw-fg-3)",
                    }}
                  >
                    {c.label}
                  </span>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    position: "relative",
                  }}
                >
                  {c.items.map((it) => (
                    <li
                      key={it}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        fontSize: 16,
                        color: c.accent ? "var(--iw-fg)" : "var(--iw-fg-2)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {c.accent ? (
                        <Ic.check width={16} height={16} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }} />
                      ) : (
                        <Ic.x width={16} height={16} style={{ color: "var(--iw-fg-3)", flexShrink: 0, marginTop: 3 }} />
                      )}
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
