"use client";

import { geoFaqItems } from "@/lib/geo-faq";

type Props = { className?: string; id?: string };

/**
 * FAQ content matching FAQPage JSON-LD — semantic dl/dt/dd for AI crawlers.
 */
export function GeoFaqBlock({ className, id }: Props) {
  return (
    <section
      {...(id ? { id } : {})}
      aria-label="Frequently asked questions"
      className={className ?? "marketing-slab marketing-slab--continue"}
    >
      <div className="container" style={{ maxWidth: 880 }}>
        <h2
          className="geo-faq-heading"
          style={{
            fontSize: "clamp(1.5rem, 2.2vw, 1.85rem)",
            fontWeight: 600,
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}
        >
          Common questions
        </h2>
        <dl
          style={{
            margin: 0,
            display: "grid",
            gap: 0,
            borderTop: "1px solid var(--iw-hairline)",
          }}
        >
          {geoFaqItems.map((item) => (
            <div
              key={item.q}
              style={{
                borderBottom: "1px solid var(--iw-hairline)",
                padding: "20px 0",
                display: "grid",
                gap: 8,
              }}
            >
              <dt
                style={{
                  fontWeight: 600,
                  color: "var(--iw-fg)",
                  fontSize: 16,
                  margin: 0,
                }}
              >
                {item.q}
              </dt>
              <dd style={{ margin: 0, color: "var(--iw-fg-1)", fontSize: 16, lineHeight: 1.65 }}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
