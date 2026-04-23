"use client";

import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { PageHero } from "@/components/page-hero";
import { SectionLabel } from "@/components/section-label";
import { Btn, Reveal } from "@/components/primitives";

const values = [
  {
    t: "Diagnose before you build.",
    b: "We don't start engagements by pitching solutions. We start by understanding your operations. The Diagnostic exists because building the wrong thing faster is not a service.",
  },
  {
    t: "Engineer, don't bolt.",
    b: "Every integration we create is designed from the architecture up — not cobbled together and crossed fingers. Systems fail at the seams. We design for the seams.",
  },
  {
    t: "Stay accountable after launch.",
    b: "Most agencies disappear after delivery. Our retainer model is built around the assumption that production systems need ongoing care. We make that easy to budget and easy to manage.",
  },
] as const;

export function AboutPageContent() {
  return (
    <main className="iw-with-bc">
      <BreadcrumbNav
        items={[
          { name: "IntraWeb Technologies", href: "/" },
          { name: "About", current: true },
        ]}
      />
      <PageHero
        title={
          <>
            Built by an engineer.
            <br />
            Operated like one, too.
          </>
        }
        subhead="IntraWeb is a boutique AI and automation studio based in northern New Jersey. We\u2019re not an agency with layers of account management and outsourced execution. We\u2019re a senior engineering practice with direct delivery and a bias toward building things that work."
      />

      <section className="marketing-slab marketing-slab--continue">
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.6rem, 2.4vw, 2rem)", fontWeight: 600, marginBottom: 20 }}>
              Who you&apos;re working with.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)" }}>
              IntraWeb is led by John Schibelli — a senior engineer and AI systems architect with 15+ years of experience
              building production systems for brands and businesses across the NJ/NYC metro.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 16 }}>
              He started IntraWeb because he kept seeing the same pattern: businesses getting sold on technology that
              nobody maintained, integrated, or actually used.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)", marginTop: 16 }}>
              IntraWeb is the answer to that problem — an engineering practice that takes ownership of the full system, not
              just the build.
            </p>
            <p
              style={{
                marginTop: 32,
                padding: 20,
                border: "1px solid var(--card-border-on-dark)",
                borderLeft: "4px solid var(--color-accent)",
                color: "var(--iw-fg-1)",
                lineHeight: 1.7,
                fontSize: 16,
                background: "var(--page-bg-elevated-dark)",
                borderRadius: 12,
              }}
            >
              We build systems that are fast, reliable, and maintainable. That means production-grade architecture from day
              one — no shortcuts that create problems six months after launch. When integrations break or AI models drift,
              we&apos;re already watching.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="marketing-slab marketing-slab--stack">
        <div className="container">
          <Reveal>
            <div style={{ marginBottom: 16 }}>
              <SectionLabel>How we work</SectionLabel>
            </div>
            {values.map((v, i) => (
              <div key={v.t} style={{ marginBottom: i < values.length - 1 ? 32 : 0, maxWidth: 720 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10, color: "var(--iw-fg)" }}>{i + 1}. {v.t}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--iw-fg-1)" }}>{v.b}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="marketing-slab marketing-slab--stack marketing-slab--page-end">
        <div className="container">
          <Reveal>
            <h2 style={{ fontSize: "clamp(1.5rem, 2.2vw, 1.8rem)", fontWeight: 600, marginBottom: 24, maxWidth: 640 }}>
              Ready to work with someone who actually understands the stack?
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Btn href="/diagnostic" variant="primary">
                Start with a Diagnostic
              </Btn>
              <Btn href="/start" icon={false} variant="secondary">
                Tell us what you&apos;re working on
              </Btn>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
