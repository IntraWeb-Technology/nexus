"use client";

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { PageHero } from "@/components/page-hero";
import { SectionLabel } from "@/components/section-label";
import { Btn, Reveal } from "@/components/primitives";

export function WorkPageContent() {
  return (
    <main className="iw-with-bc">
      <BreadcrumbNav
        items={[
          { name: "IntraWeb Technologies", href: "/" },
          { name: "Work", current: true },
        ]}
      />
      <PageHero
        title="Real systems. Real results."
        subhead="Every engagement is different. This section will host case studies as they are published: client type, challenge, what we built, quantified outcomes, and service tags."
      />

      <section className="marketing-slab marketing-slab--continue">
        <div className="container">
          <Reveal>
            <div style={{ marginBottom: 16 }}>
              <SectionLabel>Case studies</SectionLabel>
            </div>
            <p style={{ color: "var(--iw-fg-2)", fontSize: 16, marginBottom: 24 }}>
              Placeholder grid — more projects will be added here.
            </p>
            <div
              className="card"
              style={{
                padding: 32,
                maxWidth: 720,
                minHeight: 200,
                borderLeft: "3px solid var(--color-accent)",
                background: "var(--page-bg-elevated-dark)",
                borderRadius: 12,
                opacity: 0.6,
                border: "1px solid var(--card-border-on-dark)",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  color: "var(--iw-fg-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 500,
                }}
              >
                Coming soon
              </h2>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="marketing-slab marketing-slab--stack marketing-slab--page-end">
        <div className="container" style={{ maxWidth: 720 }}>
          <Reveal>
            <div style={{ marginBottom: 8 }}>
              <SectionLabel>Your story next</SectionLabel>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>Want to be in this section?</h2>
            <p style={{ color: "var(--iw-fg-1)", lineHeight: 1.7, fontSize: 16, marginBottom: 24 }}>
              We&apos;re selectively taking on new clients. Start with a Diagnostic and we&apos;ll tell you honestly
              whether IntraWeb is the right fit.
            </p>
            <Btn href="/diagnostic" variant="primary">
              Book a Diagnostic
            </Btn>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
