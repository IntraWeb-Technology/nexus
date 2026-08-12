"use client";

import { geoFaqItems } from "@/lib/geo-faq";
import type { GeoFaqPair } from "@/lib/cms-content-types";

type Props = {
  className?: string;
  id?: string;
  /** CMS or hardcoded FAQ pairs; defaults to `geoFaqItems`. */
  items?: GeoFaqPair[];
};

/**
 * FAQ content matching FAQPage JSON-LD — collapsible rows (native `details` / `summary`).
 */
export function GeoFaqBlock({ className, id, items }: Props) {
  const faqItems = items?.length
    ? items
    : geoFaqItems.map((item) => ({ q: item.q, a: item.a }));

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
        <div className="geo-faq-accordion">
          {faqItems.map((item) => (
            <details key={item.q} className="geo-faq-accordion__item" name="geo-faq-accordion">
              <summary className="geo-faq-accordion__summary">{item.q}</summary>
              <p className="geo-faq-accordion__body">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
